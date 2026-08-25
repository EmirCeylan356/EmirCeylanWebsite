// Site audit: screenshots at every breakpoint, axe-core violations, page
// weight, and Lighthouse (mobile + desktop) for the key pages.
// Writes everything to audit/<name>/.
//
//   node scripts/audit.mjs <name> [--url http://localhost:4321] [--no-lh]
//                                 [--pages /,/hobbies] [--reduced]
//
// Expects a server already running (`npm run preview`) unless --url points at
// a remote origin. Used for audit/baseline and audit/after so the morning
// report can show before/after numbers.
import { chromium, firefox } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync, readFileSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const name = args[0] || 'run';
const opt = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d; };
const BASE = opt('--url', 'http://localhost:4321').replace(/\/$/, '');
const NO_LH = args.includes('--no-lh');
const REDUCED = args.includes('--reduced');
const LH_ONLY = args.includes('--lh-only');
const PAGES = opt('--pages', '/,/hobbies,/work-4b8b954c2493,/gallery-088c0fbff746,/visitor-gallery-admin').split(',');
const LH_PAGES = opt('--lh-pages', '/,/hobbies').split(',');
const BREAKPOINTS = [[360, 640], [390, 844], [414, 896], [768, 1024], [1280, 800], [1920, 1080]];

const out = join('audit', name);
mkdirSync(out, { recursive: true });
const slug = p => (p === '/' ? 'index' : p.replace(/^\//, '').replace(/\//g, '_'));

const report = { name, base: BASE, date: new Date().toISOString(), axe: {}, lighthouse: {}, weights: {}, overflow: {} };

// ── Screenshots + axe (Chromium) ─────────────────────────────────────────────
const browser = await chromium.launch();
for (const p of (LH_ONLY ? [] : PAGES)) {
  for (const [w, h] of BREAKPOINTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: REDUCED ? 'reduce' : 'no-preference' });
    const page = await ctx.newPage();
    let status = 'ERR';
    try { const r = await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 60000 }); status = r?.status(); } catch (e) { status = 'ERR ' + e.message; }
    await page.waitForTimeout(1000);
    // Scroll through so scroll-triggered reveals fire before the screenshot
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 160)); }
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 500));
    });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await page.screenshot({ path: join(out, `${slug(p)}_${w}x${h}${REDUCED ? '_reduced' : ''}.png`), fullPage: true });
    if (overflow > 0) report.overflow[`${p}@${w}`] = overflow;
    if (w === 390 || w === 1280) {
      const axe = await new AxeBuilder({ page }).analyze();
      report.axe[`${p}@${w}`] = axe.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, targets: v.nodes.slice(0, 5).map(n => n.target.join(' ')) }));
    }
    await ctx.close();
  }
}

// ── Page weight (resource bytes over the wire, full scroll) ──────────────────
for (const p of (LH_ONLY ? [] : PAGES.slice(0, 2))) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const res = [];
  page.on('response', r => {
    r.body().then(buf => res.push({ url: r.url(), type: r.request().resourceType(), bytes: buf.length })).catch(() => {});
  });
  await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); }
  });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1500);
  const byType = {};
  for (const r of res) byType[r.type] = (byType[r.type] || 0) + r.bytes;
  const largest = [...res].sort((a, b) => b.bytes - a.bytes).slice(0, 6).map(r => ({ url: r.url.replace(BASE, ''), bytes: r.bytes }));
  report.weights[p] = { requests: res.length, totalBytes: res.reduce((a, r) => a + r.bytes, 0), byType, largest };
  await ctx.close();
}
await browser.close();

// ── Firefox sanity pass ──────────────────────────────────────────────────────
if (!LH_ONLY) try {
  const ff = await firefox.launch();
  for (const p of PAGES.slice(0, 2)) for (const [w, h] of [[390, 844], [1280, 800]]) {
    const ctx = await ff.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(out, `${slug(p)}_${w}x${h}_firefox.png`), fullPage: true });
    await ctx.close();
  }
  await ff.close();
} catch (e) { console.warn('firefox pass skipped:', e.message); }

// ── Lighthouse ───────────────────────────────────────────────────────────────
if (!NO_LH) {
  const { default: lighthouse } = await import('lighthouse');
  const { launch } = await import('chrome-launcher');
  const chromePath = chromium.executablePath();
  for (const p of LH_PAGES) for (const form of ['mobile', 'desktop']) {
    const chrome = await launch({ chromePath, chromeFlags: ['--headless=new', '--no-sandbox'] });
    try {
      const flags = { port: chrome.port, output: 'json', logLevel: 'error', formFactor: form };
      if (form === 'desktop') {
        flags.screenEmulation = { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false };
        flags.throttling = { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 };
      }
      const r = await lighthouse(BASE + p, flags);
      const lhr = r.lhr;
      const cat = k => Math.round((lhr.categories[k]?.score ?? 0) * 100);
      const aud = k => lhr.audits[k]?.numericValue;
      report.lighthouse[`${p}@${form}`] = {
        performance: cat('performance'), accessibility: cat('accessibility'), bestPractices: cat('best-practices'), seo: cat('seo'),
        lcpMs: Math.round(aud('largest-contentful-paint') || 0), cls: +(aud('cumulative-layout-shift') || 0).toFixed(3),
        tbtMs: Math.round(aud('total-blocking-time') || 0), fcpMs: Math.round(aud('first-contentful-paint') || 0),
        totalBytes: aud('total-byte-weight'),
        failing: Object.values(lhr.audits).filter(a => a.score !== null && a.score < 0.9 && !['informative', 'notApplicable', 'manual'].includes(a.scoreDisplayMode)).map(a => `${a.id} (${a.score})`).slice(0, 30),
      };
      writeFileSync(join(out, `lighthouse_${slug(p)}_${form}.json`), r.report);
    } catch (e) { report.lighthouse[`${p}@${form}`] = { error: e.message }; }
    finally { try { await chrome.kill(); } catch { /* Windows EPERM on temp profile cleanup — harmless */ } }
  }
}

// ── dist size ────────────────────────────────────────────────────────────────
function dirSize(d) { let s = 0; for (const f of readdirSync(d, { withFileTypes: true })) { const fp = join(d, f.name); s += f.isDirectory() ? dirSize(fp) : statSync(fp).size; } return s; }
try { report.distBytes = dirSize('dist'); } catch {}

if (LH_ONLY) { try { const prev = JSON.parse(readFileSync(join(out, 'report.json'), 'utf8')); Object.assign(report, { ...prev, lighthouse: report.lighthouse, distBytes: report.distBytes }); } catch {} }
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  lighthouse: report.lighthouse,
  axe: Object.fromEntries(Object.entries(report.axe).map(([k, v]) => [k, v.map(x => `${x.id}×${x.nodes}`)])),
  weights: Object.fromEntries(Object.entries(report.weights).map(([k, v]) => [k, { requests: v.requests, totalBytes: v.totalBytes, byType: v.byType, largest: v.largest }])),
  overflow: report.overflow,
  distBytes: report.distBytes,
}, null, 2));

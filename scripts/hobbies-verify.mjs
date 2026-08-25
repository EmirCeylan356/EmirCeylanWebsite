// Hobbies page verification: tab screenshots, lightbox, axe, image bytes, overflow.
// Usage: BASE=http://localhost:4331 node scripts/hobbies-verify.mjs [--reduced]
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:4321';
const OUT = 'audit/work';
const reduced = process.argv.includes('--reduced');
fs.mkdirSync(OUT, { recursive: true });

const b = await chromium.launch();
const results = { overflow: {}, tabHeights: {}, axe: {}, imageBytes: {}, errors: [] };

async function fullScroll(page) {
  await page.evaluate(async () => {
    const H = document.body.scrollHeight;
    for (let y = 0; y < H; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
    window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 500));
  });
}
async function scrollGallery(page) {
  await page.evaluate(async () => {
    const v = document.getElementById('art-viewport'); if (!v) return;
    v.scrollIntoView();
    for (let x = 0; x <= v.scrollWidth; x += 600) { v.scrollLeft = x; await new Promise(r => setTimeout(r, 120)); }
    v.scrollLeft = 0; await new Promise(r => setTimeout(r, 400));
  });
}

for (const [w, h] of [[360, 640], [390, 844], [414, 896], [768, 1024], [1280, 800], [1920, 1080]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const imgBytes = [];
  page.on('response', async (r) => {
    if (r.request().resourceType() === 'image') { try { imgBytes.push((await r.body()).length); } catch {} }
  });
  page.on('pageerror', e => results.errors.push(`${w}: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') results.errors.push(`${w}: ${m.text()}`); });
  await page.goto(BASE + '/hobbies', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const tag = reduced ? `_reduced` : '';
  const shots = w === 390 || w === 1280 || w === 360 || w === 768;
  for (const tab of ['sport', 'art', 'think']) {
    await page.click(`[data-tab="${tab}"]`);
    await page.waitForTimeout(500);
    if (tab === 'art') await scrollGallery(page);
    await fullScroll(page);
    await page.waitForLoadState('networkidle');
    results.overflow[`${w}/${tab}`] = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    results.tabHeights[w] = await page.evaluate(() => Math.min(...[...document.querySelectorAll('[role=tab]')].map(b => b.getBoundingClientRect().height)));
    if (shots) await page.screenshot({ path: `${OUT}/hobbies_${tab}_${w}${tag}.png`, fullPage: true });
    if (w === 390 || w === 1280) {
      const axe = await new AxeBuilder({ page }).analyze();
      results.axe[`${w}/${tab}`] = axe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target.join(' ')).slice(0, 8) }));
    }
  }
  // Lightbox: open via keyboard on first card, page with ArrowRight, screenshot.
  await page.click('[data-tab="art"]');
  await page.waitForTimeout(400);
  await page.focus('.art-btn');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  const lbOpen = await page.evaluate(() => document.getElementById('art-lightbox')?.open === true);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(600);
  await page.waitForLoadState('networkidle');
  const counter = await page.textContent('#art-lb-counter');
  const focusIn = await page.evaluate(() => !!document.activeElement?.closest('#art-lightbox'));
  if (shots) await page.screenshot({ path: `${OUT}/hobbies_lightbox_${w}${tag}.png`, fullPage: false });
  if (w === 390 || w === 1280) {
    const axe = await new AxeBuilder({ page }).analyze();
    results.axe[`${w}/lightbox`] = axe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target.join(' ')).slice(0, 8) }));
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const restored = await page.evaluate(() => document.activeElement?.classList.contains('art-btn'));
  results[`lightbox_${w}`] = { lbOpen, counter, focusIn, restored };
  results.imageBytes[w] = imgBytes.reduce((a, n) => a + n, 0);
  await ctx.close();
}
await b.close();
console.log(JSON.stringify(results, null, 1));

// Apply the CSP from vercel.json to a local preview (which doesn't read
// vercel.json) and report every violation across all routes.
//   BASE=http://localhost:4340 node scripts/csp-check.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const base = process.env.BASE || 'http://localhost:4321';
const csp = JSON.parse(readFileSync('vercel.json', 'utf8')).headers[0].headers.find(h => h.key === 'Content-Security-Policy').value;
const PAGES = ['/', '/hobbies/', '/blog/', '/now/', '/uses/', '/404', '/work-4b8b954c2493/', '/cv-4b8b954c2493/', '/gallery-088c0fbff746/', '/visitor-gallery-admin/'];
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/*', async (route) => {
  if (!route.request().url().startsWith(base)) return route.continue();
  const res = await route.fetch();
  const ct = res.headers()['content-type'] || '';
  if (ct.includes('text/html')) route.fulfill({ response: res, headers: { ...res.headers(), 'content-security-policy': csp } });
  else route.fulfill({ response: res });
});
let total = 0;
for (const p of PAGES) {
  const page = await ctx.newPage();
  const v = [];
  await page.addInitScript(() => { window.__csp = []; document.addEventListener('securitypolicyviolation', e => window.__csp.push(`${e.violatedDirective} ← ${e.blockedURI || e.sourceFile || 'inline'}${e.lineNumber ? ':' + e.lineNumber : ''}`)); });
  page.on('console', m => { if (m.type() === 'error' && /Content Security Policy/.test(m.text())) v.push(m.text().slice(0, 160)); });
  await page.goto(base + p, { waitUntil: 'networkidle' }).catch(e => v.push('nav: ' + e.message));
  await page.waitForTimeout(1500);
  const ev = await page.evaluate(() => window.__csp);
  const all = [...new Set([...ev, ...v])];
  total += all.length;
  console.log(`${p}: ${all.length} violation(s)`); for (const x of all) console.log('   ' + x);
  await page.close();
}
console.log(total ? `CSP: ${total} violation(s)` : 'CSP: clean on all routes');
await b.close(); process.exit(total ? 1 : 0);

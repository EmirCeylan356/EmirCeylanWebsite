// Baseline-comparable page weight: load /hobbies, full vertical scroll, no clicks (same as scripts/audit.mjs).
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:4321';
const b = await chromium.launch();
for (const mode of ['baseline-procedure', 'art-tab-visible']) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const res = [];
  page.on('response', async (r) => { try { res.push({ type: r.request().resourceType(), bytes: (await r.body()).length }); } catch {} });
  await page.goto(BASE + '/hobbies', { waitUntil: 'networkidle' });
  if (mode === 'art-tab-visible') { await page.click('[data-tab="art"]'); await page.waitForTimeout(400); }
  await page.evaluate(async () => { const H = document.body.scrollHeight; for (let y = 0; y < H; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 160)); } });
  await page.waitForLoadState('networkidle'); await page.waitForTimeout(800);
  const img = res.filter(r => r.type === 'image').reduce((a, r) => a + r.bytes, 0);
  const imgN = res.filter(r => r.type === 'image').length;
  console.log(JSON.stringify({ mode, imageBytes: img, imageRequests: imgN, totalBytes: res.reduce((a, r) => a + r.bytes, 0) }));
  await ctx.close();
}
await b.close();

// Quick screenshot helper: node scripts/shot.mjs <path> <width> <height> <out.png> [--reduced] [--nofull]
import { chromium } from 'playwright';
const [p, w, h, out] = process.argv.slice(2);
const reduced = process.argv.includes('--reduced');
const full = !process.argv.includes('--nofull');
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('http://localhost:4321' + p, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.evaluate(async () => { const H = document.body.scrollHeight; for (let y = 0; y < H; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 160)); } window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 700)); });
await page.screenshot({ path: out, fullPage: full });
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
console.log(JSON.stringify({ overflow, errors }));
await b.close();

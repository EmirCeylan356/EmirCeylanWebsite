// axe + keyboard walk for one page: node scripts/a11y-page.mjs <path> [--base URL]
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const p = process.argv[2] || '/';
const base = process.env.BASE || 'http://localhost:4321';
const b = await chromium.launch();
for (const w of [390, 1280]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 844 } }); const page = await ctx.newPage();
  await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const r = await new AxeBuilder({ page }).analyze();
  console.log(`axe ${p} @${w}: ${r.violations.length} violations`);
  for (const v of r.violations) console.log(`  - ${v.id} (${v.impact}) ×${v.nodes.length}: ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`);
  if (w === 1280) {
    const seen = [];
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return null; const cs = getComputedStyle(a); const r = a.getBoundingClientRect(); return { tag: a.tagName.toLowerCase(), text: (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 28), outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0, h: Math.round(r.height), w: Math.round(r.width) }; });
      if (!info) break; seen.push(info);
    }
    console.log('tab order:', seen.map(s => `${s.tag}[${s.text}]${s.outline ? '' : ' NO-RING'}${s.h < 24 ? ' TINY' : ''}`).join(' → '));
  }
  await ctx.close();
}
await b.close();

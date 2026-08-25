// Log every layout-shift with its source nodes: node scripts/cls-trace.mjs <path> [width]
import { chromium } from 'playwright';
const p = process.argv[2] || '/'; const w = +(process.argv[3] || 1350);
const base = process.env.BASE || 'http://localhost:4321';
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: w, height: 940 } }); const page = await ctx.newPage();
await page.addInitScript(() => {
  window.__cls = [];
  new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (e.hadRecentInput) continue; window.__cls.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), src: (e.sources || []).map(s => { const n = s.node; if (!n) return '?'; const el = n.nodeType === 3 ? n.parentElement : n; return (el.tagName || '#text') + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0, 2).join('.') : '') + ` [${Math.round(s.previousRect.top)}→${Math.round(s.currentRect.top)}, h${Math.round(s.previousRect.height)}→${Math.round(s.currentRect.height)}]`; }) }); } }).observe({ type: 'layout-shift', buffered: true });
});
await page.goto(base + p, { waitUntil: 'networkidle' }); await page.waitForTimeout(4000);
const cls = await page.evaluate(() => window.__cls);
let total = 0; for (const c of cls) { total += c.v; console.log(`${c.t}ms  +${c.v}  ${c.src.join(' | ')}`); }
console.log('TOTAL', total.toFixed(3));
await b.close();

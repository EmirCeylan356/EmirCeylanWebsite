// Visitor-gallery verification: draws a stroke through Pointer Events, exercises
// undo / fullscreen / lightbox, forces the empty and error states by intercepting
// the Supabase REST calls, runs axe on the gallery and admin pages at 390 and
// 1280, and writes screenshots to audit/work/.
//
//   BASE=http://localhost:4332 node scripts/gallery-check.mjs
//
// Exits 1 if any axe violation, page error, or horizontal overflow is found.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync } from 'node:fs';

const BASE = (process.env.BASE || 'http://localhost:4332').replace(/\/$/, '');
const GALLERY = '/gallery-088c0fbff746/';
const ADMIN = '/visitor-gallery-admin/';
const OUT = 'audit/work';
mkdirSync(OUT, { recursive: true });

const SB_REST = /supabase\.co\/rest\/v1\//;
let failures = 0;
const fail = (m) => { failures++; console.log('FAIL', m); };
const ok = (m) => console.log(' ok ', m);

const browser = await chromium.launch();

async function open(path, w, h, { route } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 500 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  if (route) await page.route(SB_REST, route);
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  return { ctx, page, errors };
}

async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

async function axe(page, label) {
  const r = await new AxeBuilder({ page }).analyze();
  if (r.violations.length) {
    fail(`${label}: ${r.violations.length} axe violation(s)`);
    for (const v of r.violations) console.log('   ', v.id, '×' + v.nodes.length, v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | '));
  } else ok(`${label}: axe clean`);
}

// ── Gallery: empty state (Supabase returns []) ───────────────────────────────
for (const [w, h] of [[390, 844], [360, 640], [1280, 800]]) {
  const { ctx, page, errors } = await open(GALLERY, w, h, {
    route: (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  });
  const ov = await overflow(page);
  if (ov > 0) fail(`gallery ${w}px overflows by ${ov}px`); else ok(`gallery ${w}px no overflow`);
  const emptyVisible = await page.locator('#gallery-empty').isVisible();
  if (!emptyVisible) fail(`gallery ${w}px empty state not shown`); else ok(`gallery ${w}px empty state`);
  await page.screenshot({ path: `${OUT}/gallery_${w}_empty.png`, fullPage: true });
  if (w !== 360) await axe(page, `gallery ${w}px (empty)`);
  if (errors.length) fail(`gallery ${w}px page errors: ${errors.join(' ; ')}`);
  await ctx.close();
}

// ── Gallery: draw a stroke, undo, fullscreen, submit validation ──────────────
{
  const { ctx, page, errors } = await open(GALLERY, 1280, 800, {
    route: (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  });
  const cv = page.locator('#drawing-canvas');
  await cv.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const box = await cv.boundingBox();
  const px = (fx, fy) => ({ x: box.x + box.width * fx, y: box.y + box.height * fy });

  // crimson brush, large size
  await page.click('[data-color="#C41E3A"]');
  await page.click('[data-size="l"]');
  let p = px(0.15, 0.2);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  for (let i = 1; i <= 30; i++) { p = px(0.15 + 0.7 * (i / 30), 0.2 + 0.5 * Math.sin(i / 4)); await page.mouse.move(p.x, p.y); }
  await page.mouse.up();
  // cyan fill on a blank area
  await page.click('[data-color="#00E5FF"]');
  await page.click('[data-tool="fill"]');
  p = px(0.9, 0.9);
  await page.mouse.click(p.x, p.y);

  const previewShown = await page.locator('#preview-img').isVisible();
  if (!previewShown) fail('preview did not update after drawing'); else ok('stroke + fill drawn, preview updated');
  const undoEnabled = await page.locator('#undo-btn').isEnabled();
  if (!undoEnabled) fail('undo not enabled after drawing'); else ok('undo enabled');
  const pressed = await page.locator('[data-tool="fill"]').getAttribute('aria-pressed');
  if (pressed !== 'true') fail('aria-pressed not synced on fill tool'); else ok('aria-pressed synced');
  await page.screenshot({ path: `${OUT}/gallery_1280_drawn.png`, fullPage: false });

  // validation: name missing → error box announced
  await page.click('#submit-btn');
  const errShown = await page.locator('#err-box').isVisible();
  if (!errShown) fail('validation error not shown'); else ok('validation error shown: ' + (await page.locator('#err-body').textContent()));

  // undo twice → canvas blank again
  await page.click('#undo-btn');
  await page.click('#undo-btn');
  const blankAgain = await page.locator('#preview-empty').isVisible();
  if (!blankAgain) fail('undo did not restore blank canvas'); else ok('undo restored blank canvas');

  // keyboard: arrow keys in toolbar
  await page.focus('[data-tool="brush"]');
  await page.keyboard.press('ArrowRight');
  const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-tool'));
  if (focused !== 'eraser') fail('toolbar arrow-key nav broken'); else ok('toolbar arrow-key nav');

  // fullscreen
  await page.click('#fullscreen-btn');
  const fsVisible = await page.locator('#fs-overlay').isVisible();
  if (!fsVisible) fail('fullscreen overlay not shown'); else ok('fullscreen overlay shown');
  await page.screenshot({ path: `${OUT}/gallery_1280_fullscreen.png` });
  await axe(page, 'gallery 1280px (fullscreen)');
  await page.keyboard.press('Escape');
  const fsHidden = await page.locator('#fs-overlay').isHidden();
  if (!fsHidden) fail('Escape did not close fullscreen'); else ok('Escape closes fullscreen');
  const canvasBack = await page.locator('#canvas-panel #drawing-canvas').count();
  if (canvasBack !== 1) fail('canvas did not return to panel'); else ok('canvas returned to panel');

  await axe(page, 'gallery 1280px (drawn, error box)');
  if (errors.length) fail(`gallery drawn page errors: ${errors.join(' ; ')}`);
  await ctx.close();
}

// ── Gallery: with items (mock 3 rows incl. one unsafe src) + lightbox ───────
{
  const tiny = await (async () => {
    const c = await browser.newPage();
    const d = await c.evaluate(() => {
      const cv = document.createElement('canvas'); cv.width = 600; cv.height = 390;
      const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 600, 390);
      x.strokeStyle = '#C41E3A'; x.lineWidth = 14; x.beginPath(); x.moveTo(60, 300); x.bezierCurveTo(200, 20, 400, 380, 540, 80); x.stroke();
      return cv.toDataURL('image/jpeg', 0.5);
    });
    await c.close();
    return d;
  })();
  const rows = [
    { id: 'a1', name: 'Ada <b>Lovelace</b>', title: 'First "Program"', image_data: tiny, created_at: '2026-08-20T10:00:00Z' },
    { id: 'a2', name: 'Bot', title: 'javascript', image_data: 'javascript:alert(1)', created_at: '2026-08-21T10:00:00Z' },
    { id: 'a3', name: 'Grace', title: 'Compiler', image_data: tiny, created_at: '2026-08-22T10:00:00Z' },
    { id: 'a4', name: 'Linus', title: 'Kernel', image_data: tiny, created_at: '2026-08-23T10:00:00Z' },
  ];
  for (const [w, h] of [[390, 844], [1280, 800]]) {
    const { ctx, page, errors } = await open(GALLERY, w, h, {
      route: (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(rows) }),
    });
    const tiles = await page.locator('.archive-tile').count();
    if (tiles !== 3) fail(`gallery ${w}px expected 3 safe tiles, got ${tiles}`); else ok(`gallery ${w}px unsafe image_data skipped (3/4 tiles)`);
    const anyBadSrc = await page.evaluate(() => Array.from(document.images).some((i) => i.src.startsWith('javascript:')));
    if (anyBadSrc) fail('javascript: URL reached an <img src>');
    await page.locator('.archive-tile').first().focus();
    await page.keyboard.press('Enter');
    const lbOpen = await page.locator('#lightbox').evaluate((d) => d.open);
    if (!lbOpen) fail(`gallery ${w}px lightbox did not open from keyboard`); else ok(`gallery ${w}px lightbox opens via keyboard`);
    await page.screenshot({ path: `${OUT}/gallery_${w}_lightbox.png` });
    await axe(page, `gallery ${w}px (lightbox open)`);
    await page.keyboard.press('Escape');
    await page.screenshot({ path: `${OUT}/gallery_${w}_grid.png`, fullPage: true });
    await axe(page, `gallery ${w}px (grid)`);
    if (errors.length) fail(`gallery ${w}px grid page errors: ${errors.join(' ; ')}`);
    await ctx.close();
  }
}

// ── Gallery: error state (Supabase unreachable) ──────────────────────────────
{
  const { ctx, page } = await open(GALLERY, 390, 844, { route: (r) => r.abort('connectionrefused') });
  const errVisible = await page.locator('#gallery-error').isVisible();
  if (!errVisible) fail('gallery error state not shown'); else ok('gallery error state shown');
  await page.screenshot({ path: `${OUT}/gallery_390_error.png`, fullPage: true });
  await axe(page, 'gallery 390px (error)');
  await ctx.close();
}

// ── Admin: sign-in view ──────────────────────────────────────────────────────
for (const [w, h] of [[390, 844], [1280, 800]]) {
  const { ctx, page, errors } = await open(ADMIN, w, h);
  const ov = await overflow(page);
  if (ov > 0) fail(`admin ${w}px overflows by ${ov}px`); else ok(`admin ${w}px no overflow`);
  const html = await page.content();
  if (/emir2026/.test(html)) fail('hardcoded password still in admin HTML');
  await page.screenshot({ path: `${OUT}/admin_${w}.png`, fullPage: true });
  await axe(page, `admin ${w}px (sign-in)`);
  if (errors.length) fail(`admin ${w}px page errors: ${errors.join(' ; ')}`);
  await ctx.close();
}

await browser.close();
console.log(failures ? `\n${failures} failure(s)` : '\nALL CHECKS PASSED');
process.exit(failures ? 1 : 0);

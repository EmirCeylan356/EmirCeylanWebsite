/**
 * build-cv-pdf.mjs — renders /cv-4b8b954c2493/ to a static PDF.
 *
 *   node scripts/build-cv-pdf.mjs
 *
 * Run this after editing src/data/profile.ts (or src/styles/print.css), then
 * COMMIT the resulting public/cv-4b8b954c2493/Emir_Ceylan_CV.pdf. Vercel's
 * build image has no Chromium, so the PDF is a committed static asset rather
 * than a build step.
 *
 * What it does: `astro build` into a temp outDir → `astro preview` on port
 * 4334 → Playwright chromium prints the CV page with print media emulated
 * (A4, CSS @page size, zero extra margin) → cleans up the temp build and
 * kills the preview server.
 */
import { spawn } from 'node:child_process';
import { mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = '.tmp-build-cvpdf';
const PORT = 4334;
const ROUTE = '/cv-4b8b954c2493/';
const PDF_DIR = path.join(ROOT, 'public', 'cv-4b8b954c2493');
const PDF = path.join(PDF_DIR, 'Emir_Ceylan_CV.pdf');
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function run(args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(npx, args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32', ...opts });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${args.join(' ')} exited ${code}`))));
    child.on('error', reject);
  });
}

async function waitFor(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); if (r.ok) return; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`preview never came up at ${url}`);
}

let preview;
try {
  console.log('[cv-pdf] building →', OUT_DIR);
  await run(['astro', 'build', '--outDir', OUT_DIR]);

  console.log('[cv-pdf] preview on', PORT);
  preview = spawn(npx, ['astro', 'preview', '--outDir', OUT_DIR, '--port', String(PORT)], {
    cwd: ROOT, stdio: 'ignore', shell: process.platform === 'win32',
  });
  const base = `http://localhost:${PORT}`;
  await waitFor(base + ROUTE);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1400 } });
  await page.goto(base + ROUTE, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  await page.evaluate(() => document.fonts.ready);
  await mkdir(PDF_DIR, { recursive: true });
  await page.pdf({ path: PDF, format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await browser.close();

  const { size } = await stat(PDF);
  console.log(`[cv-pdf] wrote ${path.relative(ROOT, PDF)} (${(size / 1024).toFixed(0)} KB). Commit it.`);
} finally {
  if (preview) {
    if (process.platform === 'win32') spawn('taskkill', ['/pid', String(preview.pid), '/T', '/F'], { stdio: 'ignore' });
    else preview.kill('SIGTERM');
  }
  await rm(path.join(ROOT, OUT_DIR), { recursive: true, force: true }).catch(() => {});
}

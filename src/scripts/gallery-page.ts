/**
 * Visitor gallery client: drawing canvas, submit form, single mosaic gallery
 * with lightbox. Bundled by Astro from src/pages/gallery-088c0fbff746.astro.
 *
 * Security notes: the anon key is public; the real gate is RLS (docs/SUPABASE.md).
 * Everything below is defence in depth: length clamps, size cap, blank-canvas
 * rejection, honeypot, per-tab rate limit, and image-src validation on render.
 */
import { supabase, isConfigured, GALLERY_TABLE, type GallerySubmission } from '../lib/supabase';
import { NAME_MAX, TITLE_MAX, IMAGE_MAX_CHARS, isSafeImageSrc, cleanText, formatDate, el } from '../lib/gallery-utils';
import seedData from '../data/gallery-submissions.json';

interface SeedItem { name: string; title: string; image: string; date: string }
const SEEDS: GallerySubmission[] = ((seedData as unknown as SeedItem[]) || []).map((s, i) => ({
  id: `seed-${i}`, name: s.name, title: s.title, image_data: s.image, created_at: s.date,
}));

const RATE_LIMIT_MS = 30_000;
const RATE_KEY = 'vg_last_submit';
const UNDO_MAX = 20;
const CANVAS_BG = '#FFFFFF';
const SIZES: Record<string, number> = { s: 3, m: 8, l: 16 };

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

/* ── DOM ──────────────────────────────────────────────────────────────── */
const cv = $('drawing-canvas') as HTMLCanvasElement;
const ctx = cv.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
const toolbar = $('canvas-toolbar')!;
const canvasWrap = $('canvas-wrap')!;
const canvasPanel = $('canvas-panel')!;
const fsOverlay = $('fs-overlay')!;
const fsSlot = $('fs-slot')!;
const undoBtn = $('undo-btn') as HTMLButtonElement;
const fsBtn = $('fullscreen-btn') as HTMLButtonElement;
const canvasStatus = $('canvas-status')!;

const form = $('submit-form') as HTMLFormElement;
const successBox = $('success-box')!;
const submitBtn = $('submit-btn') as HTMLButtonElement;
const submitText = $('submit-text')!;
const submitSpin = $('submit-spin')!;
const prevImg = $('preview-img') as HTMLImageElement;
const prevEmpty = $('preview-empty')!;
const nameInp = $('inp-name') as HTMLInputElement;
const titleInp = $('inp-title') as HTMLInputElement;
const honeypot = $('inp-website') as HTMLInputElement;
const errBox = $('err-box')!;
const errBody = $('err-body')!;

const artworkCount = $('artwork-count')!;
const archiveCount = $('archive-count')!;
const stateLoading = $('gallery-loading')!;
const stateEmpty = $('gallery-empty')!;
const stateError = $('gallery-error')!;
const grid = $('archive-grid')!;
const retryBtn = $('gallery-retry') as HTMLButtonElement;
const lightbox = $('lightbox') as HTMLDialogElement;

/* ── Canvas state ─────────────────────────────────────────────────────── */
let tool: 'brush' | 'eraser' | 'fill' = 'brush';
let color = '#222222';
let size = SIZES.m;
let drawing = false;
let drawn = false;
let activePointer: number | null = null;
const undoStack: ImageData[] = [];

function resetCanvas(): void {
  ctx.fillStyle = CANVAS_BG;
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}
resetCanvas();

function pushUndo(): void {
  undoStack.push(ctx.getImageData(0, 0, cv.width, cv.height));
  if (undoStack.length > UNDO_MAX) undoStack.shift();
  undoBtn.disabled = false;
}

/** True if every pixel is still the background colour (cheap stride scan). */
function canvasIsBlank(): boolean {
  const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] !== 255 || d[i + 1] !== 255 || d[i + 2] !== 255) return false;
  }
  return true;
}

function refreshPreview(): void {
  drawn = !canvasIsBlank();
  if (drawn) {
    prevImg.src = cv.toDataURL('image/jpeg', 0.5);
    prevImg.hidden = false;
    prevEmpty.hidden = true;
  } else {
    prevImg.removeAttribute('src');
    prevImg.hidden = true;
    prevEmpty.hidden = false;
  }
}

/* ── Toolbar state / ARIA ─────────────────────────────────────────────── */
const toolButtons = Array.from(toolbar.querySelectorAll<HTMLButtonElement>('[data-tool]'));
const colorButtons = Array.from(toolbar.querySelectorAll<HTMLButtonElement>('[data-color]'));
const sizeButtons = Array.from(toolbar.querySelectorAll<HTMLButtonElement>('[data-size]'));

function syncToolbar(): void {
  toolButtons.forEach((b) => {
    const on = b.dataset.tool === tool;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-pressed', String(on));
  });
  colorButtons.forEach((b) => {
    const on = tool !== 'eraser' && b.dataset.color === color;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-pressed', String(on));
  });
  sizeButtons.forEach((b) => {
    const on = SIZES[b.dataset.size || ''] === size;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-pressed', String(on));
  });
  cv.classList.toggle('cursor-fill', tool === 'fill');
  canvasStatus.textContent = `${tool.toUpperCase()} · ${size}px · ${colorName(color)}`;
}
function colorName(hex: string): string {
  const b = colorButtons.find((x) => x.dataset.color === hex);
  return b?.dataset.name || hex;
}

toolButtons.forEach((b) => b.addEventListener('click', () => { tool = b.dataset.tool as typeof tool; syncToolbar(); }));
colorButtons.forEach((b) => b.addEventListener('click', () => { color = b.dataset.color || color; tool = 'brush'; syncToolbar(); }));
sizeButtons.forEach((b) => b.addEventListener('click', () => { size = SIZES[b.dataset.size || 'm']; syncToolbar(); }));

$('clear-btn')?.addEventListener('click', () => {
  if (!canvasIsBlank()) pushUndo();
  resetCanvas();
  refreshPreview();
});

undoBtn.addEventListener('click', () => {
  const snap = undoStack.pop();
  if (!snap) return;
  ctx.putImageData(snap, 0, 0);
  undoBtn.disabled = undoStack.length === 0;
  refreshPreview();
});

/* Roving arrow-key navigation inside the toolbar (WAI-ARIA toolbar pattern). */
toolbar.addEventListener('keydown', (e) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
  const items = Array.from(toolbar.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
  const idx = items.indexOf(document.activeElement as HTMLButtonElement);
  if (idx < 0) return;
  e.preventDefault();
  let next = idx;
  if (e.key === 'ArrowLeft') next = (idx - 1 + items.length) % items.length;
  if (e.key === 'ArrowRight') next = (idx + 1) % items.length;
  if (e.key === 'Home') next = 0;
  if (e.key === 'End') next = items.length - 1;
  items[next].focus();
});

/* ── Flood fill ───────────────────────────────────────────────────────── */
function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}
function floodFill(cx: number, cy: number): void {
  const W = cv.width, H = cv.height;
  if (cx < 0 || cy < 0 || cx >= W || cy >= H) return;
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  const i0 = (cy * W + cx) * 4;
  const [tr, tg, tb, ta] = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]];
  const [fr, fg, fb] = hexToRgb(color);
  if (tr === fr && tg === fg && tb === fb && ta === 255) return;
  const stack = [cy * W + cx];
  const seen = new Uint8Array(W * H);
  while (stack.length) {
    const p = stack.pop() as number;
    if (seen[p]) continue;
    const i = p * 4;
    if (d[i] !== tr || d[i + 1] !== tg || d[i + 2] !== tb || d[i + 3] !== ta) continue;
    seen[p] = 1;
    d[i] = fr; d[i + 1] = fg; d[i + 2] = fb; d[i + 3] = 255;
    const x = p % W;
    if (x > 0) stack.push(p - 1);
    if (x < W - 1) stack.push(p + 1);
    if (p >= W) stack.push(p - W);
    if (p < W * (H - 1)) stack.push(p + W);
  }
  ctx.putImageData(img, 0, 0);
}

/* ── Drawing (Pointer Events: mouse, touch and pen through one path) ──── */
function pos(e: PointerEvent): { x: number; y: number } {
  const r = cv.getBoundingClientRect();
  return { x: ((e.clientX - r.left) * cv.width) / r.width, y: ((e.clientY - r.top) * cv.height) / r.height };
}
cv.addEventListener('pointerdown', (e) => {
  if (activePointer !== null || (e.button !== 0 && e.pointerType === 'mouse')) return;
  e.preventDefault();
  const p = pos(e);
  pushUndo();
  if (tool === 'fill') {
    floodFill(Math.round(p.x), Math.round(p.y));
    refreshPreview();
    return;
  }
  activePointer = e.pointerId;
  try { cv.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  drawing = true;
  ctx.lineWidth = size;
  ctx.strokeStyle = tool === 'eraser' ? CANVAS_BG : color;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  // A tap with no movement still leaves a dot.
  ctx.lineTo(p.x + 0.01, p.y);
  ctx.stroke();
});
cv.addEventListener('pointermove', (e) => {
  if (!drawing || e.pointerId !== activePointer) return;
  e.preventDefault();
  const p = pos(e);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
});
function endStroke(e: PointerEvent): void {
  if (!drawing || e.pointerId !== activePointer) return;
  drawing = false;
  activePointer = null;
  ctx.beginPath();
  try { cv.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  refreshPreview();
}
cv.addEventListener('pointerup', endStroke);
cv.addEventListener('pointercancel', endStroke);
cv.addEventListener('lostpointercapture', endStroke);

/* ── Fullscreen: the SAME canvas + toolbar move into a fixed overlay ──── */
let fullscreen = false;
const toolbarHome = document.createComment('toolbar-home');
const canvasHome = document.createComment('canvas-home');

function setFullscreen(on: boolean): void {
  if (on === fullscreen) return;
  fullscreen = on;
  if (on) {
    toolbar.replaceWith(toolbarHome);
    canvasWrap.replaceWith(canvasHome);
    fsSlot.append(toolbar, canvasWrap);
    // Hoist out of #main-content's stacking context so the overlay sits above the fixed header/progress bar.
    if (fsOverlay.parentElement !== document.body) document.body.append(fsOverlay);
    fsOverlay.hidden = false;
    document.body.classList.add('vg-fs-lock');
    document.addEventListener('keydown', onFsKey);
  } else {
    toolbarHome.replaceWith(toolbar);
    canvasHome.replaceWith(canvasWrap);
    fsOverlay.hidden = true;
    document.body.classList.remove('vg-fs-lock');
    document.removeEventListener('keydown', onFsKey);
  }
  canvasPanel.classList.toggle('is-fullscreen', on);
  fsBtn.setAttribute('aria-pressed', String(on));
  fsBtn.setAttribute('aria-label', on ? 'Exit fullscreen canvas' : 'Fullscreen canvas');
  fsBtn.textContent = on ? 'EXIT' : '⛶';
  fsBtn.focus();
}
function onFsKey(e: KeyboardEvent): void { if (e.key === 'Escape') setFullscreen(false); }
fsBtn.addEventListener('click', () => setFullscreen(!fullscreen));

/* ── Form errors (aria-live region) ───────────────────────────────────── */
function showError(msg: string): void {
  errBody.textContent = msg;
  errBox.classList.add('show');
  errBox.hidden = false;
}
function hideError(): void {
  errBox.classList.remove('show');
  errBox.hidden = true;
}
$('err-dismiss')?.addEventListener('click', hideError);
$('err-retry')?.addEventListener('click', () => { void trySubmit(); });

/** Re-encode until under the cap; returns null if even the lowest quality is too large. */
function encodeUnderCap(): string | null {
  for (const q of [0.6, 0.45, 0.32, 0.22, 0.15]) {
    const data = cv.toDataURL('image/jpeg', q);
    if (data.length <= IMAGE_MAX_CHARS) return data;
  }
  return null;
}

function rateLimited(): number {
  try {
    const last = Number(sessionStorage.getItem(RATE_KEY) || 0);
    const left = RATE_LIMIT_MS - (Date.now() - last);
    return left > 0 ? Math.ceil(left / 1000) : 0;
  } catch { return 0; }
}

async function trySubmit(): Promise<void> {
  hideError();
  const name = cleanText(nameInp.value, NAME_MAX);
  const title = cleanText(titleInp.value, TITLE_MAX);
  if (honeypot.value) return showError('Submission rejected.');
  if (!name) return showError('Add your name first — even "Anonymous" works.');
  if (name.length > NAME_MAX) return showError(`Name must be ${NAME_MAX} characters or fewer.`);
  if (!title) return showError('Give your piece a title before transmitting.');
  if (title.length > TITLE_MAX) return showError(`Title must be ${TITLE_MAX} characters or fewer.`);
  if (canvasIsBlank()) return showError('Draw something on the canvas first.');
  const wait = rateLimited();
  if (wait) return showError(`Easy — one transmission every 30 seconds. Try again in ${wait}s.`);
  if (!supabase) return showError('Supabase is not configured on this deployment, so submissions are disabled.');

  const imageData = encodeUnderCap();
  if (!imageData) return showError('This drawing is too detailed to store (over 400 KB). Simplify it a little and try again.');

  submitBtn.disabled = true;
  submitText.hidden = true;
  submitSpin.hidden = false;
  try {
    const res = await supabase.from(GALLERY_TABLE).insert([{ name, title, image_data: imageData }]).select('id').single();
    if (res.error) throw new Error(res.error.message);
    try { sessionStorage.setItem(RATE_KEY, String(Date.now())); } catch { /* ignore */ }
    form.hidden = true;
    successBox.hidden = false;
    const mine: GallerySubmission = { id: String(res.data?.id ?? 'local'), name, title, image_data: imageData, created_at: new Date().toISOString() };
    await loadGallery(mine);
    $('gallery-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'Unknown error';
    showError(err instanceof TypeError
      ? 'Failed to reach the archive server. Check your connection and try again.'
      : `Submission failed: ${m}.`);
  } finally {
    submitBtn.disabled = false;
    submitText.hidden = false;
    submitSpin.hidden = true;
  }
}
form.addEventListener('submit', (e) => { e.preventDefault(); void trySubmit(); });

$('draw-another-btn')?.addEventListener('click', () => {
  resetCanvas();
  undoStack.length = 0;
  undoBtn.disabled = true;
  refreshPreview();
  nameInp.value = '';
  titleInp.value = '';
  successBox.hidden = true;
  form.hidden = false;
  hideError();
  canvasPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ── Gallery: one mosaic + lightbox ───────────────────────────────────── */
type GalleryState = 'loading' | 'empty' | 'error' | 'grid';
function setState(s: GalleryState): void {
  stateLoading.hidden = s !== 'loading';
  stateEmpty.hidden = s !== 'empty';
  stateError.hidden = s !== 'error';
  grid.hidden = s !== 'grid' && s !== 'error';
}

function openLightbox(it: GallerySubmission): void {
  const img = lightbox.querySelector<HTMLImageElement>('#lb-img')!;
  img.src = it.image_data;
  img.alt = `${it.title} by ${it.name}`;
  lightbox.querySelector('#lb-title')!.textContent = it.title;
  lightbox.querySelector('#lb-author')!.textContent = `— ${it.name}`;
  lightbox.querySelector('#lb-date')!.textContent = formatDate(it.created_at);
  lightbox.showModal();
}
lightbox.querySelector('#lb-close')?.addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
lightbox.addEventListener('close', () => { lightbox.querySelector<HTMLImageElement>('#lb-img')!.removeAttribute('src'); });

function renderGrid(items: GallerySubmission[]): number {
  grid.replaceChildren();
  let n = 0;
  for (const it of items) {
    if (!isSafeImageSrc(it.image_data)) continue; // never let an unknown URL reach <img src>
    const title = cleanText(it.title, TITLE_MAX) || 'Untitled';
    const name = cleanText(it.name, NAME_MAX) || 'Anonymous';
    const date = formatDate(it.created_at, { month: 'short', day: '2-digit' }).toUpperCase();
    const tile = el('button', { type: 'button', class: 'archive-tile', 'aria-label': `Open "${title}" by ${name}` },
      el('img', { src: it.image_data, alt: '', loading: 'lazy', width: '600', height: '390' }),
      el('span', { class: 'date', 'aria-hidden': 'true', text: date }),
      el('span', { class: 'ovl', 'aria-hidden': 'true' },
        el('span', { class: 't', text: title }),
        el('span', { class: 'a', text: `— ${name}` }),
      ),
    );
    tile.addEventListener('click', () => openLightbox({ ...it, title, name }));
    grid.append(tile);
    n++;
  }
  return n;
}

async function loadGallery(prepend: GallerySubmission | null = null): Promise<void> {
  setState('loading');
  let items: GallerySubmission[] = [];
  let failed = false;
  if (supabase) {
    try {
      const res = await supabase.from(GALLERY_TABLE)
        .select('id, name, title, image_data, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (res.error) throw res.error;
      items = (res.data || []) as GallerySubmission[];
    } catch (err) {
      console.warn('[gallery] load failed', err);
      failed = true;
    }
  }
  if (prepend && !items.some((i) => i.id === prepend.id)) items.unshift(prepend);
  items.push(...SEEDS);
  const n = renderGrid(items);
  artworkCount.textContent = '/' + String(n).padStart(2, '0');
  archiveCount.textContent = String(n).padStart(2, '0');
  if (failed) setState('error');
  else setState(n === 0 ? 'empty' : 'grid');
}
retryBtn.addEventListener('click', () => { void loadGallery(); });

/* ── Init ─────────────────────────────────────────────────────────────── */
if (!isConfigured) $('setup-warning')!.hidden = false;
syncToolbar();
refreshPreview();
undoBtn.disabled = true;
void loadGallery();

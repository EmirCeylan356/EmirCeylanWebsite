// ── Interactive cursor grid ────────────────────────────────────────────────
// Subtle dark grid lines that brighten (crimson accent) and displace near the
// cursor. Desktop fine-pointer only; mobile and reduced-motion get the static
// CSS grid instead (zero runtime cost). The rAF loop stops completely once the
// cursor settles, and pauses while the tab is hidden.
export function initCursorGrid() {
  const cv = document.getElementById('grid-canvas') as HTMLCanvasElement | null;
  if (!cv) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(max-width: 800px), (pointer: coarse), (hover: none)').matches;
  if (reduced || coarse) { cv.remove(); return; }

  const staticGrid = document.getElementById('grid-bg-static');
  if (staticGrid) staticGrid.style.display = 'none';

  const ctx = cv.getContext('2d');
  if (!ctx) return;

  const CELL = 64;    // grid spacing — matches the .grid-bg fallback
  const STEP = 24;    // sampling step along each line (for displacement)
  const RADIUS = 240; // cursor influence radius
  const PUSH = 16;    // max displacement in px
  const BASE = 'rgba(138,138,147,0.10)';

  const DPR = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  let W = 0, H = 0;

  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, a: 0, ta: 0 };

  function warp(x: number, y: number): [number, number] {
    const dx = x - mouse.x, dy = y - mouse.y;
    const d2 = dx * dx + dy * dy;
    if (d2 > RADIUS * RADIUS || d2 < 0.01) return [x, y];
    const d = Math.sqrt(d2);
    const f = 1 - d / RADIUS;
    const k = f * f * PUSH * mouse.a / d;
    return [x + dx * k, y + dy * k];
  }

  function buildPath() {
    const path = new Path2D();
    for (let gx = 0.5; gx <= W + CELL; gx += CELL) {
      for (let y = 0; y <= H + STEP; y += STEP) {
        const [px, py] = warp(gx, Math.min(y, H));
        y === 0 ? path.moveTo(px, py) : path.lineTo(px, py);
      }
    }
    for (let gy = 0.5; gy <= H + CELL; gy += CELL) {
      for (let x = 0; x <= W + STEP; x += STEP) {
        const [px, py] = warp(Math.min(x, W), gy);
        x === 0 ? path.moveTo(px, py) : path.lineTo(px, py);
      }
    }
    return path;
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    const path = buildPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = BASE;
    ctx.stroke(path);

    // Crimson glow around the cursor
    if (mouse.a > 0.01 && mouse.x > -999) {
      const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, RADIUS);
      g.addColorStop(0, 'rgba(196,30,58,' + (0.50 * mouse.a).toFixed(3) + ')');
      g.addColorStop(0.55, 'rgba(196,30,58,' + (0.16 * mouse.a).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(196,30,58,0)');
      ctx.strokeStyle = g;
      ctx.stroke(path);
    }
  }

  function resize() {
    if (!ctx || !cv) return;
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = Math.floor(W * DPR);
    cv.height = Math.floor(H * DPR);
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    draw();
  }

  let running = false;
  function frame() {
    if (document.hidden) { running = false; return; }
    mouse.x += (mouse.tx - mouse.x) * 0.18;
    mouse.y += (mouse.ty - mouse.y) * 0.18;
    mouse.a += (mouse.ta - mouse.a) * 0.10;
    draw();
    const settled =
      Math.abs(mouse.tx - mouse.x) < 0.4 &&
      Math.abs(mouse.ty - mouse.y) < 0.4 &&
      Math.abs(mouse.ta - mouse.a) < 0.005;
    if (settled) {
      running = false;
      if (mouse.ta === 0) { mouse.a = 0; draw(); }
      return;
    }
    requestAnimationFrame(frame);
  }
  function wake() {
    if (!running) { running = true; requestAnimationFrame(frame); }
  }

  window.addEventListener('pointermove', (e) => {
    mouse.tx = e.clientX; mouse.ty = e.clientY; mouse.ta = 1;
    if (mouse.x < -999) { mouse.x = e.clientX; mouse.y = e.clientY; }
    wake();
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { mouse.ta = 0; wake(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 80);
  });
  resize();
}

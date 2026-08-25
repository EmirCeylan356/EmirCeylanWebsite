/* ═══ DNA HELIX + MOUSE PARALLAX ════════════════════════════════════════════
   Improvement #1 (background portion):
   - Layered DNA double helix with painter's algorithm for depth.
   - Mousemove parallax: front strands shift more than back strands
     (parallax driven by canvas-wide transform + per-segment depth offset).
   - Respects prefers-reduced-motion.
═══════════════════════════════════════════════════════════════════════════════ */

(function () {
  const cv  = document.getElementById('dna-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0;
  function resize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ── Mouse parallax target / current (lerped) ──────────────────────────────
  const target = { x: 0, y: 0 };
  const cur    = { x: 0, y: 0 };
  const MAX = 22; // ~20-22 px displacement, per spec

  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / window.innerWidth)  - 0.5;
    const ny = (e.clientY / window.innerHeight) - 0.5;
    target.x = nx * MAX;
    target.y = ny * MAX;
  }, { passive: true });

  // ── Scroll progress (helix fades as you scroll down) ──────────────────────
  let scrollP = 0;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollP = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  }, { passive: true });

  // ── Helix params ──────────────────────────────────────────────────────────
  let time = 0;
  const BASES = ['A','T','G','C','A','T','G','C'];

  function drawHelix(alpha) {
    if (alpha <= 0) return;
    const cx   = W / 2;
    const amp  = Math.min(W * 0.13, 140);
    const freq = 2.6;
    const segs = 180;
    const rot  = time * 0.55;

    const s1 = [], s2 = [];
    for (let i = 0; i <= segs; i++) {
      const t     = i / segs;
      const y     = -10 + t * (H + 20);
      const angle = t * Math.PI * 2 * freq + rot;
      const cosA  = Math.cos(angle);
      const depth = (cosA + 1) / 2; // 0 back → 1 front
      // depth-driven parallax: front strands offset more than back
      const px = cur.x * (0.4 + depth * 1.6);
      const py = cur.y * (0.4 + depth * 1.6);
      s1.push({ x: cx + amp * cosA + px, y: y + py, depth });
      s2.push({ x: cx - amp * cosA - cur.x * (0.4 + (1 - depth) * 1.6),
                y: y - cur.y * (0.4 + (1 - depth) * 1.6),
                depth: 1 - depth });
    }

    // Rungs (back to front via sort below)
    ctx.lineCap = 'round';

    // Painter's algorithm — collect segments and sort by depth
    const allSegs = [];
    for (let i = 0; i < segs; i++) {
      const d1 = (s1[i].depth + s1[i+1].depth) / 2;
      const d2 = (s2[i].depth + s2[i+1].depth) / 2;
      allSegs.push({ p: s1[i], q: s1[i+1], d: d1 });
      allSegs.push({ p: s2[i], q: s2[i+1], d: d2 });
    }
    allSegs.sort((a, b) => a.d - b.d);

    // Rungs
    for (let i = 0; i <= segs; i += 6) {
      const a = s1[i], b = s2[i];
      const d = (a.depth + b.depth) / 2;
      ctx.globalAlpha = alpha * (0.08 + d * 0.28);
      ctx.strokeStyle = '#3A5C70';
      ctx.lineWidth   = 1 + d * 2.5;
      ctx.shadowColor = 'rgba(0,229,255,0.25)';
      ctx.shadowBlur  = d > 0.5 ? 4 : 0;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      if (i % 12 === 0) {
        ctx.globalAlpha = alpha * d * 0.35;
        ctx.fillStyle   = '#6A8AA0';
        ctx.shadowBlur  = 0;
        ctx.font        = 'bold 9px monospace';
        ctx.textAlign   = 'center';
        ctx.fillText(BASES[(i / 6) % BASES.length], (a.x + b.x) / 2, a.y - 1);
        ctx.textAlign   = 'left';
      }
    }

    // Strands
    for (const seg of allSegs) {
      const lw = 3 + seg.d * 14;
      const a  = 0.18 + seg.d * 0.72;

      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur  = seg.d > 0.65 ? 8 : (seg.d > 0.4 ? 3 : 0);
      ctx.globalAlpha = alpha * a;
      ctx.lineWidth   = lw;
      ctx.strokeStyle = seg.d > 0.55 ? '#5A7A95' : '#3A4E60';
      ctx.beginPath();
      ctx.moveTo(seg.p.x, seg.p.y);
      ctx.lineTo(seg.q.x, seg.q.y);
      ctx.stroke();

      if (seg.d > 0.55) {
        ctx.shadowBlur  = 0;
        ctx.globalAlpha = alpha * (seg.d - 0.55) * 0.6;
        ctx.lineWidth   = Math.max(1, lw * 0.2);
        ctx.strokeStyle = 'rgba(180,225,240,0.75)';
        ctx.beginPath();
        ctx.moveTo(seg.p.x - 2.5, seg.p.y);
        ctx.lineTo(seg.q.x - 2.5, seg.q.y);
        ctx.stroke();
      }
    }
    ctx.shadowBlur = 0;
  }

  function frame() {
    requestAnimationFrame(frame);
    if (!reduced) time += 0.014;

    // Lerp mouse target
    cur.x += (target.x - cur.x) * 0.08;
    cur.y += (target.y - cur.y) * 0.08;

    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    // Fade helix between scroll 0.25 → 0.7
    const alpha = scrollP < 0.25 ? 1
                : scrollP < 0.7  ? 1 - (scrollP - 0.25) / 0.45
                : 0;

    drawHelix(alpha);
    ctx.globalAlpha = 1;
  }

  // Kick off
  requestAnimationFrame(frame);
})();

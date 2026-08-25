/* ═══════════════════════════════════════════════════════════════════════════
   HERO BACKGROUND OPTIONS — 3 interactive canvas fields
   Each accepts a <canvas> and sizes to its parent. Cursor-reactive.
   Usage: new DotMatrix(canvasEl), new Contours(canvasEl), new EKG(canvasEl)
═══════════════════════════════════════════════════════════════════════════ */
(function () {
  const ACCENT = [196, 30, 58];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Shared: DPR-aware canvas sizing + local pointer tracking */
  class Field {
    constructor(canvas) {
      this.cv = canvas;
      this.ctx = canvas.getContext('2d');
      this.dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      this.m = { x: -9999, y: -9999, active: false };
      this.t = 0;
      this._resize = this.resize.bind(this);
      window.addEventListener('resize', this._resize);
      this.resize();

      const move = (e) => {
        const r = this.cv.getBoundingClientRect();
        const px = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
        const py = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
        this.m.x = px; this.m.y = py; this.m.active = true;
      };
      this.cv.addEventListener('pointermove', move, { passive: true });
      this.cv.addEventListener('pointerleave', () => { this.m.active = false; this.m.x = -9999; this.m.y = -9999; });

      // pause when off-screen
      this.visible = true;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((es) => { this.visible = es[0].isIntersecting; })
          .observe(this.cv);
      }
      requestAnimationFrame(() => this.loop());
    }
    resize() {
      const r = this.cv.getBoundingClientRect();
      this.w = Math.max(1, r.width);
      this.h = Math.max(1, r.height);
      this.cv.width = Math.floor(this.w * this.dpr);
      this.cv.height = Math.floor(this.h * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      if (this.onResize) this.onResize();
    }
    loop() {
      requestAnimationFrame(() => this.loop());
      this.t++;
      if (!this.visible) return;
      this.draw();
    }
  }

  /* ─── OPTION A — REACTIVE DOT MATRIX ──────────────────────────────────────
     Even grid of dots. Cursor lights + gently displaces nearby dots.
     A slow crimson "scan" pulse sweeps across so it's alive when idle. */
  class DotMatrix extends Field {
    onResize() {
      this.gap = Math.max(26, Math.min(40, this.w / 34));
      this.dots = [];
      for (let y = this.gap * 0.5; y < this.h; y += this.gap)
        for (let x = this.gap * 0.5; x < this.w; x += this.gap)
          this.dots.push({ x, y });
    }
    draw() {
      const { ctx, w, h, m } = this;
      ctx.clearRect(0, 0, w, h);
      const R = 150;                       // cursor influence radius
      const scan = ((this.t * 0.9) % (w + 360)) - 180;   // sweeping x
      for (const d of this.dots) {
        let r = 1.15, a = 0.16, cr = false;
        // cursor influence
        if (m.active) {
          const dx = d.x - m.x, dy = d.y - m.y, dist = Math.hypot(dx, dy);
          if (dist < R) {
            const f = 1 - dist / R;
            r += f * 2.6; a += f * 0.7; cr = f > 0.45;
          }
        }
        // idle crimson scan band
        const sd = Math.abs(d.x - scan);
        if (sd < 46) { const f = 1 - sd / 46; a += f * 0.28; r += f * 0.9; if (f > 0.4) cr = true; }
        if (cr) ctx.fillStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${Math.min(1, a + 0.2).toFixed(3)})`;
        else    ctx.fillStyle = `rgba(200,205,215,${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(d.x, d.y, r, 0, 6.2832); ctx.fill();
      }
    }
  }

  /* ─── OPTION B — TOPOGRAPHIC CONTOURS ─────────────────────────────────────
     Concentric contour rings from a slowly drifting source, like a medical /
     terrain chart. Ring nearest the cursor is highlighted crimson. */
  class Contours extends Field {
    onResize() { this.cx = this.w * 0.5; this.cy = this.h * 0.5; }
    draw() {
      const { ctx, w, h, m, t } = this;
      ctx.clearRect(0, 0, w, h);
      // drifting field origin
      const ox = w * 0.5 + Math.sin(t * 0.004) * w * 0.16;
      const oy = h * 0.5 + Math.cos(t * 0.0032) * h * 0.18;
      const step = Math.max(26, Math.min(40, this.w / 30));
      const maxR = Math.hypot(w, h);
      const phase = (t * 0.35) % step;
      const mDist = m.active ? Math.hypot(m.x - ox, m.y - oy) : -1;
      ctx.lineWidth = 1;
      for (let rr = phase, i = 0; rr < maxR; rr += step, i++) {
        // warp each ring subtly for an organic, hand-charted feel
        const warp = 1 + Math.sin(i * 0.9 + t * 0.01) * 0.04;
        const near = mDist > 0 && Math.abs(rr - mDist) < step * 0.75;
        if (near) ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},0.55)`;
        else      ctx.strokeStyle = `rgba(120,160,175,${(0.10 + 0.05 * Math.sin(i * 0.5 + t * 0.008)).toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(ox, oy, rr * warp, rr * (2 - warp), Math.sin(t * 0.002) * 0.4, 0, 6.2832);
        ctx.stroke();
      }
    }
  }

  /* ─── OPTION C — EKG / VITALS WAVEFORM ────────────────────────────────────
     Faint monitor grid + a crimson heartbeat trace scrolling right→left with a
     glowing leading dot. Cursor raises the amplitude near it. */
  class EKG extends Field {
    onResize() {
      this.pts = [];
      this.res = 2;                                   // px per sample
      this.n = Math.ceil(this.w / this.res) + 2;
    }
    beat(i, phase) {
      // periodic PQRST-ish spike
      const x = ((i * this.res) * 0.06 + phase) % 60;
      if (x > 30 && x < 31.2) return -1;              // Q
      if (x >= 31.2 && x < 32) return 3.1;            // R spike
      if (x >= 32 && x < 33) return -1.3;             // S
      if (x > 20 && x < 23) return 0.35;              // P
      if (x > 36 && x < 41) return 0.6 * Math.sin((x - 36) / 5 * Math.PI); // T
      return (Math.random() - 0.5) * 0.04;            // baseline noise
    }
    draw() {
      const { ctx, w, h, m, t } = this;
      ctx.clearRect(0, 0, w, h);
      // monitor grid
      ctx.strokeStyle = 'rgba(120,160,175,0.05)';
      ctx.lineWidth = 1;
      const g = 30;
      for (let x = (t * 0.3) % g; x < w; x += g) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = g; y < h; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      const midY = h * 0.5;
      const amp = Math.min(h * 0.26, 120);
      const phase = t * 0.9;
      // trace
      ctx.beginPath();
      let lastX = 0, lastY = midY;
      for (let i = 0; i < this.n; i++) {
        const x = i * this.res;
        let v = this.beat(i, phase);
        if (m.active) {                                // cursor lifts local amplitude
          const d = Math.abs(x - m.x);
          if (d < 120) v *= 1 + (1 - d / 120) * 1.1;
        }
        const y = midY - v * amp;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        lastX = x; lastY = y;
      }
      ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},0.85)`;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},0.9)`;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
      // leading dot
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(lastX, lastY, 2.4, 0, 6.2832); ctx.fill();
    }
  }

  window.HeroFX = { DotMatrix, Contours, EKG, reduced };
})();

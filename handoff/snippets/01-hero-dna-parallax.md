# Snippet 01 — Hero DNA parallax + glitch typewriter

## Where it goes
- DNA helix parallax → replaces the existing `<script is:inline>` that draws the helix in `src/layouts/Layout.astro`.
- Typewriter → drop into the hero block in `src/pages/index.astro`, near the existing `<span class="dot">` status tag.

## CSS variables required (already in your `global.css`)
- `--bg-base`, `--bg-surface`, `--border-color`, `--accent`, `--text-secondary`

## HTML — status bar
Replace your existing `.hero-tag` markup with:

```html
<div class="hero-tag inline-flex items-center gap-3 mb-8 px-4 py-2 font-mono text-xs"
  style="background:var(--bg-surface); border:1px solid var(--border-color); color:var(--text-secondary); letter-spacing:0.14em;">
  <span style="width:6px; height:6px; border-radius:50%; background:var(--accent); display:inline-block; box-shadow:0 0 6px var(--accent);"></span>
  <span id="hero-status">SYS_ID: EC_2027 — ISTANBUL / TR — ONLINE</span>
  <span style="display:inline-block; width:7px; height:12px; background:var(--accent); margin-left:-2px; animation:tw-blink 0.85s steps(2) infinite; vertical-align:middle;"></span>
</div>

<style>
  @keyframes tw-blink { 50% { opacity: 0; } }
</style>
```

## JS — DNA parallax (replaces existing helix script in Layout.astro)

```js
const cv  = document.getElementById('dna-canvas');
if (!cv) return;
const ctx = cv.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

let W = 0, H = 0;
function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
resize(); addEventListener('resize', resize);

// Mouse parallax (lerped) — front strands move more than back
const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
const MAX = 22;
addEventListener('pointermove', e => {
  target.x = ((e.clientX / innerWidth)  - 0.5) * MAX;
  target.y = ((e.clientY / innerHeight) - 0.5) * MAX;
}, { passive: true });

let scrollP = 0;
addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  scrollP = max > 0 ? Math.min(scrollY / max, 1) : 0;
}, { passive: true });

let time = 0;
function drawHelix(alpha) {
  if (alpha <= 0) return;
  const cx = W / 2, amp = Math.min(W * 0.13, 140), freq = 2.6, segs = 180;
  const rot = time * 0.55;
  const s1 = [], s2 = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs, y = -10 + t * (H + 20);
    const a = t * Math.PI * 2 * freq + rot, cosA = Math.cos(a);
    const depth = (cosA + 1) / 2;
    // depth-driven parallax: front strands offset more
    const px = cur.x * (0.4 + depth * 1.6), py = cur.y * (0.4 + depth * 1.6);
    s1.push({ x: cx + amp * cosA + px, y: y + py, depth });
    s2.push({ x: cx - amp * cosA - cur.x * (0.4 + (1 - depth) * 1.6),
              y: y - cur.y * (0.4 + (1 - depth) * 1.6), depth: 1 - depth });
  }
  ctx.lineCap = 'round';
  const allSegs = [];
  for (let i = 0; i < segs; i++) {
    allSegs.push({ p: s1[i], q: s1[i+1], d: (s1[i].depth + s1[i+1].depth) / 2 });
    allSegs.push({ p: s2[i], q: s2[i+1], d: (s2[i].depth + s2[i+1].depth) / 2 });
  }
  allSegs.sort((a, b) => a.d - b.d);
  for (const seg of allSegs) {
    const lw = 3 + seg.d * 14, a = 0.18 + seg.d * 0.72;
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur  = seg.d > 0.65 ? 8 : (seg.d > 0.4 ? 3 : 0);
    ctx.globalAlpha = alpha * a;
    ctx.lineWidth   = lw;
    ctx.strokeStyle = seg.d > 0.55 ? '#5A7A95' : '#3A4E60';
    ctx.beginPath(); ctx.moveTo(seg.p.x, seg.p.y); ctx.lineTo(seg.q.x, seg.q.y); ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

(function frame() {
  requestAnimationFrame(frame);
  if (!reduced) time += 0.014;
  cur.x += (target.x - cur.x) * 0.08;
  cur.y += (target.y - cur.y) * 0.08;
  ctx.clearRect(0, 0, W, H); ctx.globalAlpha = 1;
  const alpha = scrollP < 0.25 ? 1 : scrollP < 0.7 ? 1 - (scrollP - 0.25) / 0.45 : 0;
  drawHelix(alpha); ctx.globalAlpha = 1;
})();
```

## JS — glitch typewriter loop

```js
const el = document.getElementById('hero-status');
const frames = [
  'SYS_ID: EC_2027 — ISTANBUL / TR — ONLINE',
  'SYS_ID: EC_2027 — SABANCI / NODE — ACTIVE',
  'SYS_ID: EC_2027 — MED_AI / REMOTE — STREAMING',
];
const GLITCH = '!@#$%&*<>/{}|+=01_';
let idx = 0, pos = frames[0].length, phase = 'hold', glitchT = 0;
el.textContent = frames[0];

function tick() {
  const t = frames[idx];
  if (phase === 'typing') {
    pos++; el.textContent = t.slice(0, pos);
    if (pos >= t.length) { phase = 'hold'; glitchT = 0; }
    setTimeout(tick, 38 + Math.random() * 30);
  } else if (phase === 'hold') {
    glitchT++;
    if (glitchT < 40) {
      if (Math.random() < 0.08) {
        const a = t.split('');
        const i = Math.floor(Math.random() * a.length);
        if (a[i] !== ' ') a[i] = GLITCH[Math.floor(Math.random() * GLITCH.length)];
        el.textContent = a.join('');
        setTimeout(() => el.textContent = t, 70);
      }
      setTimeout(tick, 60);
    } else { phase = 'erasing'; setTimeout(tick, 700); }
  } else {
    pos--; el.textContent = t.slice(0, pos);
    if (pos <= 0) { idx = (idx + 1) % frames.length; phase = 'typing'; setTimeout(tick, 400); }
    else setTimeout(tick, 22 + Math.random() * 18);
  }
}
setTimeout(tick, 2400);
```

Respects `prefers-reduced-motion`: skip the typewriter, set `el.textContent = frames[0]`. Skip the helix time-step but keep the parallax lerp (or skip both — your call).

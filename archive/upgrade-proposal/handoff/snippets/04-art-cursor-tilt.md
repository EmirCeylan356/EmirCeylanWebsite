# Snippet 04 — Art Gallery: directional cursor + 3D card tilt

## Where it goes
`src/pages/hobbies.astro` — the ART tab gallery (`#art-viewport` and `.art-item`).

## Markup — add the custom cursor element

Place at the end of `<main>` (outside the gallery container so it can position freely):

```html
<div class="art-cursor" id="art-cursor">
  <span class="arr">→</span>
  <span class="lbl">SCROLL</span>
</div>
```

Each art card needs a glare overlay inside the frame:

```html
<div class="art-item …">
  <div class="art-frame …">
    <img src={d.src} alt={d.title} draggable="false" />
    <div class="art-grain …"></div>
    <div class="glare"></div>     <!-- NEW -->
    <!-- existing title tag + info panel -->
  </div>
</div>
```

## CSS — append to your existing art-gallery styles

```css
.art-item .art-frame {
  transform-style: preserve-3d;
  perspective: 1000px;
  transition: transform .25s cubic-bezier(0.16, 1, 0.3, 1),
              border-color .25s, box-shadow .25s, filter .35s;
}

/* Cursor-tracking glare overlay */
.art-frame .glare {
  position: absolute; inset: 0;
  background: radial-gradient(
    260px circle at var(--gx, 50%) var(--gy, 50%),
    rgba(255, 255, 255, 0.22),
    transparent 60%
  );
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: 0;
  transition: opacity .25s ease;
}
.art-item:hover .glare { opacity: 1; }

/* Hide native cursor while inside the viewport */
#art-viewport { cursor: none; }

/* Directional cursor */
.art-cursor {
  position: fixed; top: 0; left: 0;
  width: 64px; height: 64px;
  pointer-events: none; z-index: 200;
  display: none;
  align-items: center; justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800; font-size: 22px;
  color: #000;
  background: var(--accent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 24px rgba(214,255,0,0.7), 0 0 60px rgba(214,255,0,0.3);
}
.art-cursor.active { display: flex; }
.art-cursor .arr { transition: transform .18s ease; }
.art-cursor.flip .arr { transform: scaleX(-1); }
.art-cursor .lbl {
  position: absolute; bottom: -22px;
  font-size: 9px; letter-spacing: 0.18em;
  color: var(--accent);
  background: rgba(0,0,0,0.7);
  padding: 2px 8px; white-space: nowrap;
}

@media (prefers-reduced-motion: reduce), (pointer: coarse) {
  .art-cursor { display: none !important; }
  #art-viewport { cursor: grab; }
  .art-item .art-frame { transition: none; }
}
```

## Script — drop into the existing art-gallery IIFE in hobbies.astro

```js
const vport  = document.getElementById('art-viewport');
const cursor = document.getElementById('art-cursor');
const cards  = document.querySelectorAll('.art-item');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

// — Directional cursor (4a) —
vport.addEventListener('pointerenter', () => { if (!REDUCED) cursor.classList.add('active'); });
vport.addEventListener('pointerleave', () =>  cursor.classList.remove('active'));
vport.addEventListener('pointermove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
  const r = vport.getBoundingClientRect();
  const xrel = (e.clientX - r.left) / r.width;
  cursor.classList.toggle('flip', xrel < 0.5);
  cursor.querySelector('.lbl').textContent = xrel < 0.5 ? '← PREV' : 'NEXT →';
});

// — 3D tilt + glare (4b) —
cards.forEach(card => {
  const frame = card.querySelector('.art-frame');
  const glare = card.querySelector('.glare');
  card.addEventListener('pointermove', e => {
    if (REDUCED) return;
    const r = frame.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top)  / r.height;
    const ry = (px - 0.5) *  16;   // ±8°
    const rx = (py - 0.5) * -16;   // ±8°
    frame.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    glare.style.setProperty('--gx', (px * 100) + '%');
    glare.style.setProperty('--gy', (py * 100) + '%');
  });
  card.addEventListener('pointerleave', () => { frame.style.transform = ''; });
});
```

## Caveat
If you keep the existing drag-to-scroll on the viewport, suppress the cursor's click-through using:
```js
vport.addEventListener('click', e => { if (dragThreshold) { e.preventDefault(); e.stopPropagation(); } }, true);
```
(Your existing code already has the `dragThreshold` flag.)

# Snippet 03 — Activities tabs: animated content transition

## Where it goes
`src/pages/hobbies.astro` — the ACTIVITIES section's `.tab-nav` and `.tab-panel` blocks.

## Markup — add the sliding indicator element

In the tab nav, append a positioned indicator child:

```html
<div class="tab-nav" style="position:relative; border-bottom:1px solid var(--border-color);">
  <button class="tab-btn active" data-tab="sport">[ SPORT ]</button>
  <button class="tab-btn"        data-tab="art">[ ART ]</button>
  <button class="tab-btn"        data-tab="think">[ THINK ]</button>
  <div class="tab-indicator" id="tab-indicator"></div>
</div>
```

The tab content needs a wrapping container so we can lock its height when switching:

```html
<div class="tab-content" id="tab-content">
  <div class="tab-panel active" data-panel="sport"> … </div>
  <div class="tab-panel"        data-panel="art"  > … </div>
  <div class="tab-panel"        data-panel="think"> … </div>
</div>
```

## CSS — replace your existing `.tab-panel` rules with

```css
.tab-indicator {
  position: absolute;
  bottom: -1px; left: 0;
  height: 2px;
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent);
  transition: transform .45s cubic-bezier(0.16, 1, 0.3, 1),
              width     .45s cubic-bezier(0.16, 1, 0.3, 1);
  width: 0;
  pointer-events: none;
}

.tab-content { position: relative; }
.tab-panel {
  position: absolute; inset: 0;
  opacity: 0;
  transform: translateY(-8px);
  pointer-events: none;
  transition: opacity .15s ease, transform .15s ease;
}
.tab-panel.active   { position: relative; opacity: 1; transform: translateY(0); pointer-events: auto; }
.tab-panel.entering { opacity: 1;          transform: translateY(0); pointer-events: auto;
                      transition: opacity .2s ease .05s, transform .2s ease .05s; }

@media (prefers-reduced-motion: reduce) {
  .tab-panel, .tab-indicator { transition: none; }
}
```

## Script — replace your existing tab handler

```js
const nav     = document.querySelector('#activities .tab-nav');
const ind     = document.getElementById('tab-indicator');
const content = document.getElementById('tab-content');
const btns    = [...nav.querySelectorAll('.tab-btn')];
const panels  = [...content.querySelectorAll('.tab-panel')];

// Lock content height to tallest panel so layout doesn't jump
function lockHeights() {
  let max = 0;
  panels.forEach(p => {
    const prev = { d: p.style.display, p: p.style.position, o: p.style.opacity };
    p.style.display = 'block'; p.style.position = 'static'; p.style.opacity = '0';
    max = Math.max(max, p.offsetHeight);
    p.style.display = prev.d; p.style.position = prev.p; p.style.opacity = prev.o;
  });
  content.style.minHeight = max + 'px';
}

function moveIndicator(btn) {
  const r = btn.getBoundingClientRect(), navR = nav.getBoundingClientRect();
  ind.style.width = r.width + 'px';
  ind.style.transform = `translateX(${r.left - navR.left}px)`;
}

function activate(name) {
  const btn = btns.find(b => b.dataset.tab === name);
  if (!btn) return;
  btns.forEach(b => b.classList.toggle('active', b === btn));
  moveIndicator(btn);

  const current = panels.find(p => p.classList.contains('active') || p.classList.contains('entering'));
  const next    = panels.find(p => p.dataset.panel === name);
  if (!next || next === current) return;

  // 1) fade current out — 150ms
  if (current) {
    current.style.transition = 'opacity .15s ease, transform .15s ease';
    current.style.opacity = '0';
    current.style.transform = 'translateY(-8px)';
    setTimeout(() => {
      current.classList.remove('active', 'entering');
      current.style.cssText = '';
    }, 160);
  }

  // 2) fade next in — 200ms (after 160ms gap)
  setTimeout(() => {
    next.classList.add('entering');
    next.style.opacity = '0';
    next.style.transform = 'translateY(8px)';
    next.offsetHeight; // reflow
    next.style.transition = 'opacity .2s ease, transform .2s ease';
    next.style.opacity = '1';
    next.style.transform = 'translateY(0)';
    setTimeout(() => {
      next.classList.remove('entering');
      next.classList.add('active');
      next.style.cssText = '';
    }, 220);
  }, 160);
}

btns.forEach(b => b.addEventListener('click', () => activate(b.dataset.tab)));

requestAnimationFrame(() => {
  lockHeights();
  moveIndicator(btns.find(b => b.classList.contains('active')) || btns[0]);
});
addEventListener('resize', () => {
  lockHeights();
  moveIndicator(btns.find(b => b.classList.contains('active')) || btns[0]);
});
```

## Why the indicator slides smoothly
The indicator's `transform: translateX(...)` and `width: …px` are set inline from the button's bounding box; the CSS transition does the interpolation. No CSS variable trickery, no per-tab class — works for any tab count.

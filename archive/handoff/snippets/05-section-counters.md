# Snippet 05 — Section counters: count-up animation

## Where it goes
- The IntersectionObserver script goes in `src/layouts/Layout.astro` so it works site-wide.
- Mark every counter element with `data-counter="N"` (and optionally `data-prefix`, `data-suffix`, `data-pad`).

## Markup — mark the section counters

Examples from your existing pages:

```astro
<!-- WORK section in index.astro -->
<span class="text-xl font-black font-mono" style="color:var(--text-secondary);"
      data-counter="07" data-prefix="/" data-pad="2">/07</span>

<!-- ACTIVITIES in hobbies.astro -->
<span class="text-xl font-black font-mono" style="color:var(--text-secondary);"
      data-counter="03" data-prefix="/" data-pad="2">/03</span>

<!-- TRAVELS in hobbies.astro -->
<span class="text-xl font-black font-mono" style="color:var(--text-secondary);"
      data-counter="26" data-prefix="/" data-pad="2">/26</span>

<!-- Any other numeric stat that should count up -->
<div class="stat-num font-black text-2xl" style="color:var(--accent);"
     data-counter="2027">2027</div>
<div class="stat-num font-black text-2xl" style="color:var(--accent);"
     data-counter="07" data-suffix="+">07+</div>
```

`data-pad="N"` zero-pads to N digits. `data-prefix`/`data-suffix` wrap the number with literal strings.

## Script — drop into Layout.astro

```js
(function counters() {
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const targets = document.querySelectorAll('[data-counter]');
  if (!targets.length) return;

  const animate = el => {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const end    = parseInt(el.dataset.counter, 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const pad    = parseInt(el.dataset.pad || '0', 10);
    if (isNaN(end)) return;

    if (REDUCED) {
      el.textContent = prefix + String(end).padStart(pad, '0') + suffix;
      return;
    }

    const dur = 820, start = performance.now();
    (function step(now) {
      const t = Math.min(1, (now - start) / dur);
      const v = Math.round(end * easeOut(t));
      el.textContent = prefix + String(v).padStart(pad, '0') + suffix;
      if (t < 1) requestAnimationFrame(step);
    })(start);
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) animate(e.target); });
  }, { threshold: 0.4 });

  targets.forEach(el => {
    // initialize to zero so the count-up is dramatic when it fires
    el.textContent = (el.dataset.prefix || '') +
                     '0'.padStart(parseInt(el.dataset.pad || '0', 10), '0') +
                     (el.dataset.suffix || '');
    io.observe(el);
  });
})();
```

## Notes
- `threshold: 0.4` means the counter fires when 40 % of the element is in the viewport — feels right for both small badges and large stat numbers.
- `data-done` prevents re-triggering on scroll-up. If you want it to re-run, remove that guard.
- For very large numbers, you may want to swap `Math.round` for `Math.floor` and add thousands separators with `Intl.NumberFormat`.

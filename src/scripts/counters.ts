// ── Count-up counters ──────────────────────────────────────────────────────
// Any element with [data-counter="<int>"] counts up from 0 when it scrolls
// into view. Optional data-prefix / data-suffix / data-pad. Under
// prefers-reduced-motion the final value is set immediately.
export function initCounters() {
  const targets = document.querySelectorAll<HTMLElement>('[data-counter]');
  if (!targets.length) return;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

  const render = (el: HTMLElement, v: number) => {
    const pad = parseInt(el.dataset.pad || '0', 10);
    el.textContent = (el.dataset.prefix || '') + String(v).padStart(pad, '0') + (el.dataset.suffix || '');
  };

  const animate = (el: HTMLElement) => {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const end = parseInt(el.dataset.counter || '', 10);
    if (isNaN(end)) return;
    if (REDUCED) { render(el, end); return; }
    const dur = 820, start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      render(el, Math.round(end * easeOut(t)));
      if (t < 1) requestAnimationFrame(step);
    };
    step(start);
  };

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => render(el, parseInt(el.dataset.counter || '0', 10)));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { animate(e.target as HTMLElement); io.unobserve(e.target); } });
  }, { threshold: 0.4 });

  targets.forEach((el) => {
    if (!REDUCED) render(el, 0);
    io.observe(el);
  });
}

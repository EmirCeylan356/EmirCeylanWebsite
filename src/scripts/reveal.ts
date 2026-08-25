// ── Scroll reveals (IntersectionObserver + CSS) ────────────────────────────
// Replaces the GSAP/ScrollTrigger reveals. Elements opt in with
// `data-reveal` (variants: "up" (default), "left", "line", "fade") and get
// `.is-in` when ~15% is visible. Children of `[data-reveal-stagger]` receive
// `--i` for staggered delays. All motion lives in global.css and is disabled
// under prefers-reduced-motion (where everything is simply shown).
export function initReveal() {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-stagger]');
  if (!els.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll<HTMLElement>('[data-reveal-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => (child as HTMLElement).style.setProperty('--i', String(i)));
  });

  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

  els.forEach((el) => io.observe(el));
}

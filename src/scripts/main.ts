// Site-wide client entry, bundled by Astro and loaded once per page.
// Everything here is progressive enhancement: the page is fully usable
// without it.
import { initCursorGrid } from './cursor-grid';
import { initCounters } from './counters';
import { initReveal } from './reveal';

function boot() {
  initReveal();
  initCounters();
  initCursorGrid();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

# Snippet 06 — Visitor Gallery: graceful errors + archive mosaic

## Where it goes
`src/pages/visitor-gallery.astro` — the submission form's `<button id="submit-btn">` flow and the section directly below the canvas tool.

---

## Part A — Error handling with retry

### Markup — replace your existing `#err-msg` block

```html
<div class="err-box" id="err-box">
  <span class="err-title">TRANSMISSION FAILED</span>
  <div class="err-body" id="err-body">Could not reach the archive server. Check your connection and try again.</div>
  <div class="err-actions">
    <button class="err-btn"       id="err-retry">RETRY ↻</button>
    <button class="err-btn ghost" id="err-dismiss">DISMISS</button>
  </div>
</div>
```

### CSS — replace `.err-box`

```css
.err-box {
  display: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  padding: 12px 14px;
  margin-bottom: 14px;
  background: rgba(255,0,85,0.07);
  border: 1px solid #FF0055;
  color: #FF0055;
  line-height: 1.6;
  position: relative;
}
.err-box.show  { display: block; animation: errShake .35s ease; }
.err-box::before {
  content: '!';
  display: inline-block;
  width: 18px; height: 18px;
  margin-right: 10px;
  border: 1px solid #FF0055;
  text-align: center; font-weight: 800;
  vertical-align: middle;
}
.err-box .err-title { font-weight: 700; letter-spacing: 0.12em; }
.err-box .err-body  { margin: 8px 0 12px 28px; opacity: 0.85; }
.err-box .err-actions { margin-left: 28px; display: flex; gap: 8px; }
.err-box .err-btn {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.12em;
  padding: 6px 12px;
  background: #FF0055; color: #fff;
  border: 1px solid #FF0055;
  cursor: pointer;
}
.err-box .err-btn.ghost { background: transparent; color: #FF0055; }
.err-box .err-btn:hover { background: #fff; color: #FF0055; }

@keyframes errShake {
  0%,100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX( 4px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX( 2px); }
}
```

### Script — replace your existing form-submit handler

```js
const errBox   = document.getElementById('err-box');
const errBody  = document.getElementById('err-body');
const submitBtn = document.getElementById('submit-btn');
let lastAttempt = null;

function showError(msg) {
  errBody.textContent = msg;
  errBox.classList.add('show');
}
function hideError() { errBox.classList.remove('show'); }

document.getElementById('err-dismiss').addEventListener('click', hideError);
document.getElementById('err-retry').addEventListener('click', () => trySubmit());

async function trySubmit() {
  hideError();
  const name  = document.getElementById('inp-name').value.trim();
  const title = document.getElementById('inp-title').value.trim();
  if (!name)  return showError('Add your name first — even "Anonymous" works.');
  if (!title) return showError('Give your piece a title before transmitting.');
  if (!drawn) return showError('Draw something on the canvas first.');

  submitBtn.disabled = true;
  const original = submitBtn.textContent;
  submitBtn.textContent = 'TRANSMITTING…';

  try {
    const imageData = cv.toDataURL('image/jpeg', 0.45);
    const sb = await getSB();   // your existing supabase client
    if (!sb) throw new Error('Supabase not configured');
    const res = await sb.from('gallery_submissions')
      .insert([{ name, title, image_data: imageData }])
      .select().single();
    if (res.error) throw new Error(res.error.message);

    // success — your existing success flow
    form.style.display = 'none';
    successBox.style.display = '';
    loadGallery({ id: res.data?.id, name, title, image_data: imageData, created_at: new Date().toISOString() });
  } catch (err) {
    let msg;
    if (err instanceof TypeError) {
      msg = 'Failed to reach the archive server. Check your network connection and try again.';
    } else if (err.message?.startsWith('HTTP')) {
      msg = `Server rejected the submission (${err.message}). Try again in a moment.`;
    } else {
      msg = `Submission failed: ${err.message || 'Unknown error'}.`;
    }
    showError(msg);
    lastAttempt = { name, title };
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = original;
  }
}

submitBtn.addEventListener('click', e => { e.preventDefault(); trySubmit(); });
// Remove the old `form.addEventListener('submit', ...)` registration.
```

---

## Part B — Archive mosaic grid

### Markup — append below the `<div class="vg-grid">` (still inside the section's `max-w-7xl mx-auto`)

```html
<div class="archive-head">
  <div class="file">ARCHIVE /</div>
  <h3 class="font-black kinetic-text" style="font-family:'Syne'; text-transform:uppercase;">PAST SUBMISSIONS</h3>
  <div class="line"></div>
  <div class="count"><span id="archive-count">0</span> ENTRIES</div>
</div>
<div class="archive-grid" id="archive-grid"></div>
```

### CSS

```css
.archive-head {
  margin-top: 56px;
  display: flex; align-items: end; gap: 16px;
}
.archive-head .file {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; color: var(--text-secondary);
  letter-spacing: 0.15em;
}
.archive-head h3   { font-size: clamp(28px, 4vw, 44px); letter-spacing: -0.01em; }
.archive-head .line { flex: 1; height: 1px; background: var(--border-color); }
.archive-head .count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px; color: var(--accent);
  letter-spacing: 0.1em;
}

.archive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-top: 24px;
}
.archive-tile {
  position: relative;
  aspect-ratio: 600/390;
  border: 1px solid var(--border-color);
  background: #fff;
  overflow: hidden;
  transition: transform .25s ease, border-color .25s, box-shadow .25s, z-index 0s .25s;
  cursor: pointer;
}
.archive-tile:hover {
  transform: scale(1.06);
  border-color: var(--accent);
  box-shadow: 0 0 24px var(--accent-glow);
  z-index: 5;
  transition-delay: 0s;
}
.archive-tile img { width: 100%; height: 100%; object-fit: cover; display: block; }
.archive-tile .ovl {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.92));
  opacity: 0; transition: opacity .2s ease;
  display: flex; flex-direction: column; justify-content: end;
  padding: 10px;
}
.archive-tile:hover .ovl { opacity: 1; }
.archive-tile .ovl .t {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; font-weight: 800;
  color: var(--accent);
  letter-spacing: 0.06em;
  line-height: 1.2;
}
.archive-tile .ovl .a {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; color: var(--text-secondary);
  margin-top: 2px;
}
.archive-tile .date {
  position: absolute; top: 4px; right: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px; color: rgba(255,255,255,0.6);
  background: rgba(0,0,0,0.6);
  padding: 1px 5px;
}
```

### Render function — call after each successful `loadGallery()`

```js
function renderArchive(items) {
  const grid  = document.getElementById('archive-grid');
  const count = document.getElementById('archive-count');
  grid.innerHTML = '';
  items.forEach(it => {
    const t = document.createElement('div');
    t.className = 'archive-tile';
    const date = it.created_at ? new Date(it.created_at).toLocaleDateString(undefined, { month: 'short', day: '2-digit' }).toUpperCase() : '';
    t.innerHTML = `
      <img src="${esc(it.image_data || '')}" alt="${esc(it.title)}" loading="lazy">
      <div class="date">${date}</div>
      <div class="ovl">
        <div class="t">${esc(it.title)}</div>
        <div class="a">— ${esc(it.name)}</div>
      </div>`;
    grid.appendChild(t);
  });
  count.textContent = String(items.length).padStart(2, '0');
}
```

Wire it into your existing `renderGallery(items)` — same data, two views (the main gallery card list above, archive mosaic below).

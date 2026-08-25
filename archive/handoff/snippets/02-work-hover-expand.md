# Snippet 02 — Work cards: hover expand

## Where it goes
`src/pages/index.astro` — the WORK section's `{works.map(...)}` block.

## CSS — add to `src/styles/global.css`

```css
.work-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: border-color .25s ease, box-shadow .25s ease, background .25s ease;
}

/* The expanding bullet container uses grid-template-rows: 0fr → 1fr.
   This is the CSS-only "auto height" expand trick — no JS needed. */
.work-card .bullets {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows .45s cubic-bezier(0.16, 1, 0.3, 1);
}
.work-card .bullets > div { overflow: hidden; }
.work-card .bullets ul {
  list-style: none;
  padding-top: 16px;
  margin-top: 14px;
  border-top: 1px dashed var(--border-color);
}
.work-card .bullets li {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  color: var(--text-secondary);
  padding: 4px 0 4px 18px;
  position: relative;
  line-height: 1.65;
}
.work-card .bullets li::before {
  content: '▸';
  position: absolute; left: 0;
  color: var(--accent);
  font-weight: 700;
}

.work-card:hover {
  border-color: var(--accent);
  box-shadow:
    0 0 0 1px var(--accent),
    0 0 32px var(--accent-glow),
    inset 0 0 60px rgba(214,255,0,0.04);
}
.work-card:hover .bullets { grid-template-rows: 1fr; }
.work-card:hover .desc    { color: var(--text-primary); }

.work-card .hint {
  position: absolute; bottom: 12px; right: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; color: var(--accent);
  letter-spacing: 0.12em; opacity: 0;
  transition: opacity .25s, transform .25s;
  transform: translateY(4px);
}
.work-card:hover .hint { opacity: 0.8; transform: translateY(0); }

@media (prefers-reduced-motion: reduce) {
  .work-card, .work-card .bullets { transition: none; }
}
```

## Markup — add a `bullets` array to each work item and render it

In your `works` data array at the top of `index.astro`, add a `bullets: string[]` field to each entry:

```js
const works = [
  {
    id: 1, period: '2026 — PRESENT', title: 'TEACHING ASSISTANT',
    subtitle: 'DSA 210: Data Science',
    description: '…',
    bullets: [
      'Lead weekly office hours, debug Python notebooks live',
      'EDA · K-anonymity · predictive modeling pipelines',
      'STACK: scikit-learn · pandas · matplotlib'
    ],
    // … existing fields
  },
  // …
];
```

Then update the card template:

```astro
<div class="work-card relative p-6 cursor-pointer" data-work-id={work.id} …>
  <p class="text-xs font-mono font-bold mb-2" style="…">{work.period}</p>
  <span class="work-title text-lg font-black mb-1 block" style="…">{work.title}</span>
  <p class="font-bold mb-3 text-sm" style="color:var(--accent);">{work.subtitle}</p>
  <p class="desc text-sm" style="color:var(--text-secondary);">{work.description}</p>

  <!-- NEW: hidden bullets revealed on hover -->
  <div class="bullets" aria-hidden="true">
    <div>
      <ul>
        {work.bullets.map(b => <li>{b}</li>)}
      </ul>
    </div>
  </div>

  <div class="hint">HOVER FOR DETAILS</div>

  <!-- existing modal-trigger details kept for click-to-open -->
  <div class="work-details hidden">
    <div class="work-content text-sm" set:html={work.details} />
  </div>
</div>
```

## Why grid-rows instead of max-height
`max-height` with a fixed target value flashes if the content is taller than the target. `grid-template-rows: 0fr → 1fr` smoothly animates to the natural height of the child — works perfectly with variable-length bullet lists.

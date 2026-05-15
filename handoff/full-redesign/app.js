/* ═══ EMIR CEYLAN — PORTFOLIO v2 — APP LOGIC ════════════════════════════════
   Six targeted enhancements, all modular:
     1. Hero glitch/typewriter status bar  (DNA parallax lives in dna.js)
     2. Work cards: hover expand revealing hidden bullets  (CSS-driven; this
        file only seeds card data)
     3. Activities tabs: animated content transition + sliding indicator
     4. Art Gallery: directional cursor + 3D card tilt + horizontal drag
     5. Section counters: count-up via IntersectionObserver (ease-out)
     6. Visitor Gallery: graceful error w/ retry, archive mosaic grid
═══════════════════════════════════════════════════════════════════════════════ */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────────────────────────────────────────────────────────────────────────
   MARQUEE — duplicate items so the loop tiles seamlessly
───────────────────────────────────────────────────────────────────────────── */
(function marquee() {
  const items = [
    'Medical AI Specialist','Data Scientist','Machine Learning Researcher',
    'Sabancı University TA','Team Leader','XAI Enthusiast',
    { txt: 'Artist', hi: true }
  ];
  const track = document.getElementById('marquee-track');
  if (!track) return;
  const render = () => items.map(it => {
    const t = typeof it === 'string' ? it : it.txt;
    const hi = typeof it === 'object' && it.hi ? ' hi' : '';
    return `<span class="${hi}">◆ ${t}</span>`;
  }).join('');
  track.innerHTML = render() + render() + render(); // 3x for seamless loop
})();

/* ─────────────────────────────────────────────────────────────────────────────
   IMPROVEMENT #1 — Hero status: glitch / typewriter loop
   Cycles through SYS_ID variants, typing each one in, glitching briefly,
   then erasing. Pure JS, no GSAP needed.
───────────────────────────────────────────────────────────────────────────── */
(function heroTypewriter() {
  const el = document.getElementById('hero-status');
  if (!el || REDUCED) return;

  const frames = [
    'SYS_ID: EC_2027 — ISTANBUL / TR — ONLINE',
    'SYS_ID: EC_2027 — SABANCI / NODE — ACTIVE',
    'SYS_ID: EC_2027 — MED_AI / REMOTE — STREAMING',
    'SYS_ID: EC_2027 — ISTANBUL / TR — ONLINE'
  ];
  const GLITCH_CHARS = '!@#$%&*<>/{}|+=01_';

  let idx = 0;
  let buf = '';
  let phase = 'typing';       // typing | hold | glitch | erasing
  let pos = 0;
  let glitchT = 0;

  function tick() {
    const target = frames[idx];
    if (phase === 'typing') {
      pos++;
      buf = target.slice(0, pos);
      el.textContent = buf;
      if (pos >= target.length) { phase = 'hold'; glitchT = 0; }
      setTimeout(tick, 38 + Math.random() * 30);
    } else if (phase === 'hold') {
      glitchT++;
      if (glitchT < 40) {
        // occasional micro-glitch — replace 1-2 chars with garbage briefly
        if (Math.random() < 0.08) {
          const a = target.split('');
          const i1 = Math.floor(Math.random() * a.length);
          const i2 = Math.floor(Math.random() * a.length);
          if (a[i1] !== ' ') a[i1] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          if (a[i2] !== ' ') a[i2] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          el.textContent = a.join('');
          setTimeout(() => { el.textContent = target; }, 70);
        }
        setTimeout(tick, 60);
      } else {
        phase = 'erasing';
        setTimeout(tick, 700);
      }
    } else if (phase === 'erasing') {
      pos--;
      buf = target.slice(0, pos);
      el.textContent = buf;
      if (pos <= 0) {
        idx = (idx + 1) % frames.length;
        phase = 'typing';
        setTimeout(tick, 400);
      } else {
        setTimeout(tick, 22 + Math.random() * 18);
      }
    }
  }
  // Start with the first frame already typed; begin the loop after a beat.
  pos = frames[0].length;
  el.textContent = frames[0];
  phase = 'hold';
  setTimeout(tick, 2400);
})();

/* ─────────────────────────────────────────────────────────────────────────────
   IMPROVEMENT #2 — Work cards: data + hover expand
   The CSS handles the actual expand (.bullets grid-template-rows transition);
   this just seeds the card content. Each card reveals 3 hidden bullets.
───────────────────────────────────────────────────────────────────────────── */
const WORKS = [
  {
    period: '2026 — PRESENT',
    title: 'TEACHING ASSISTANT',
    org: 'DSA 210: Data Science',
    desc: 'Assisting Prof. Oznur Tastan and Ozgun Yargi. Mentoring students in ML.',
    bullets: [
      'Lead weekly office hours, debug Python notebooks live',
      'EDA · K-anonymity · predictive modeling pipelines',
      'STACK: scikit-learn · pandas · matplotlib'
    ]
  },
  {
    period: '2025 — 2026 FALL',
    title: 'UNDERGRADUATE RESEARCHER',
    org: 'PURE — Sabancı University',
    desc: 'Collaborating with Prof. Polat Göktaş on Explainable AI in Healthcare.',
    bullets: [
      'Scientometric analysis of 250+ XAI in healthcare publications',
      'Identified knowledge gaps in clinician trust & AI governance',
      'STACK: literature mining · network analysis · NLP'
    ]
  },
  {
    period: '2026 — PRESENT',
    title: 'PROJECT LEAD — DEEPMYELINAI',
    org: 'Teknofest Medical AI',
    desc: 'Leading multidisciplinary team building multimodal MS diagnostic tools.',
    bullets: [
      'Multimodal: CSF biomarkers + genetic risk + clinical scores',
      'Temporal Transformer architecture for longitudinal tracking',
      'XAI layer (SHAP / LIME) · 2024 McDonald Criteria aligned'
    ]
  },
  {
    period: 'SUMMER 2026',
    title: 'MACHINE LEARNING INTERN',
    org: 'Amsterdam UMC',
    desc: 'Developing AI models to reduce unnecessary sepsis testing in ER settings.',
    bullets: [
      'Optimizing diagnostic triggers to reduce physician workload',
      'Real-world EHR data · clinical efficiency focus',
      'STATUS: Work in progress · Summer placement confirmed'
    ]
  },
  {
    period: '2024 — 2025',
    title: 'ML DEVELOPER',
    org: 'OI Pathogenicity Prediction',
    desc: 'ENS 210: Bioinformatics. Surpassing SIFT and general-purpose tools.',
    bullets: [
      'Variant classifier for COL1A1 / COL1A2 (Osteogenesis Imperfecta)',
      'ClinVar curated dataset · biologically meaningful features',
      'Outperformed SIFT on held-out test set'
    ]
  },
  {
    period: '2024 — 2025',
    title: 'RESEARCH CONTRIBUTOR',
    org: 'AI-Engineered Enzymes (PETase)',
    desc: 'Molecular Biology Research. Optimizing PETase for sustainable plastic.',
    bullets: [
      'Computational mutation screening of PETase variants',
      'Targeted thermostability + catalytic efficiency gains',
      'Synthetic biology × environmental sustainability'
    ]
  },
  {
    period: '2025 — PRESENT',
    title: 'BOARD MEMBER · HEAD OF BIOTECH',
    org: 'Sabancı Deep Technologies Club',
    desc: 'Leading the BioTech division. Workshops on the future of life sciences.',
    bullets: [
      'CRISPR · synthetic biology · AI-driven drug discovery talks',
      'Cross-faculty collaboration: CS · biology · engineering',
      'Community of ~60 active student researchers'
    ]
  }
];

(function renderWork() {
  const grid = document.getElementById('work-grid');
  if (!grid) return;
  WORKS.forEach((w, i) => {
    const card = document.createElement('article');
    card.className = 'work-card cut-corner';
    card.setAttribute('data-screen-label', `work card ${i + 1}`);
    card.innerHTML = `
      <span class="corner"></span>
      <div class="period">${w.period}</div>
      <div class="title">${w.title}</div>
      <div class="org">${w.org}</div>
      <div class="desc">${w.desc}</div>
      <div class="bullets" aria-hidden="true">
        <div>
          <ul>${w.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="hint">HOVER FOR DETAILS</div>
    `;
    grid.appendChild(card);
  });

  // Permanent WIP placeholder
  const wip = document.createElement('article');
  wip.className = 'work-card wip cut-corner';
  wip.innerHTML = `
    <div>
      <div class="mono" style="font-size:11px; color:var(--text-secondary); letter-spacing:0.12em; margin-bottom:6px;">COMING SOON</div>
      <div style="font-family:'Syne'; font-weight:800; font-size:18px; margin-bottom:6px; color:var(--text-primary);">WORK IN PROGRESS</div>
      <div style="font-size:12.5px; color:var(--text-secondary);">Something new is being built…</div>
    </div>`;
  grid.appendChild(wip);
})();

/* ─────────────────────────────────────────────────────────────────────────────
   IMPROVEMENT #3 — Activities tabs
   Sliding indicator + fade-out / fade-in content (150ms out, 200ms in)
───────────────────────────────────────────────────────────────────────────── */
(function tabs() {
  const nav  = document.querySelector('#activities .tab-nav');
  const ind  = document.getElementById('tab-indicator');
  const content = document.getElementById('tab-content');
  if (!nav || !ind || !content) return;

  const btns = Array.from(nav.querySelectorAll('.tab-btn'));
  const panels = Array.from(content.querySelectorAll('.tab-panel'));

  // Convert .active panel into the same absolute model so heights are stable
  function lockHeights() {
    // figure tallest panel & freeze container height to it
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
    const r = btn.getBoundingClientRect();
    const navR = nav.getBoundingClientRect();
    ind.style.width = r.width + 'px';
    ind.style.transform = `translateX(${r.left - navR.left}px)`;
  }

  function activate(name) {
    const btn = btns.find(b => b.dataset.tab === name);
    if (!btn) return;
    btns.forEach(b => b.classList.toggle('active', b === btn));
    moveIndicator(btn);

    const current = panels.find(p => p.classList.contains('active') || p.classList.contains('entering'));
    const next = panels.find(p => p.dataset.panel === name);
    if (!next || next === current) return;

    if (current) {
      // fade out: 150ms
      current.style.transition = 'opacity .15s ease, transform .15s ease';
      current.style.opacity = '0';
      current.style.transform = 'translateY(-8px)';
      setTimeout(() => {
        current.classList.remove('active', 'entering');
        current.style.transition = '';
        current.style.opacity = '';
        current.style.transform = '';
      }, 160);
    }

    // fade in: 200ms with slight delay so current can clear
    setTimeout(() => {
      next.classList.add('entering');
      next.style.opacity = '0';
      next.style.transform = 'translateY(8px)';
      // force reflow
      // eslint-disable-next-line no-unused-expressions
      next.offsetHeight;
      next.style.transition = 'opacity .2s ease, transform .2s ease';
      next.style.opacity = '1';
      next.style.transform = 'translateY(0)';
      setTimeout(() => {
        next.classList.remove('entering');
        next.classList.add('active');
        next.style.transition = '';
        next.style.opacity = '';
        next.style.transform = '';
      }, 220);
    }, 160);
  }

  btns.forEach(b => b.addEventListener('click', () => activate(b.dataset.tab)));

  // Init: lock heights so layout doesn't jump when switching tabs
  // & position indicator under the active button
  requestAnimationFrame(() => {
    lockHeights();
    const active = btns.find(b => b.classList.contains('active')) || btns[0];
    moveIndicator(active);
  });
  window.addEventListener('resize', () => {
    lockHeights();
    const active = btns.find(b => b.classList.contains('active')) || btns[0];
    moveIndicator(active);
  });
})();

/* ─────────────────────────────────────────────────────────────────────────────
   TRAVELS — render passport nodes
───────────────────────────────────────────────────────────────────────────── */
(function travels() {
  const nodes = document.getElementById('travel-nodes');
  const svg   = document.getElementById('travel-map');
  const coords= document.getElementById('map-coords');
  if (!nodes || !svg) return;

  const HOME = { x: 581, y: 188 };
  const PLACES = [
    ['ISTANBUL', 581, 188], ['PARIS', 490, 162], ['LISBON', 450, 182],
    ['BARCELONA', 470, 178], ['PRAGUE', 540, 150], ['BUDAPEST', 555, 162],
    ['VILNIUS', 565, 135], ['MOSCOW', 620, 130], ['BUCHAREST', 580, 175],
    ['BRATISLAVA', 550, 158], ['BELGRADE', 560, 180], ['SARAJEVO', 545, 180],
    ['ATHENS', 560, 192], ['ROME', 530, 178], ['ZURICH', 515, 165],
    ['AMSTERDAM', 514, 164], ['LONDON', 499, 166], ['TIRANA', 555, 195],
    ['SOFIA', 575, 185], ['TOKYO', 885, 170], ['BANGKOK', 770, 255],
    ['HANOI', 795, 235], ['KUALA LUMPUR', 780, 270], ['AMMAN', 620, 210],
    ['DUBROVNIK', 545, 178], ['LJUBLJANA', 535, 172]
  ];

  // Home base
  const home = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  home.innerHTML = `
    <circle cx="${HOME.x}" cy="${HOME.y}" r="4" fill="#fff"/>
    <text x="${HOME.x + 7}" y="${HOME.y + 3}" style="font-family:monospace; font-size:8px; fill:rgba(226,226,230,0.85); letter-spacing:0.08em;">IST [HOME]</text>
  `;
  nodes.appendChild(home);

  PLACES.forEach(([name, x, y]) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'travel-node');
    g.innerHTML = `
      <circle class="ring" cx="${x}" cy="${y}" r="3.5"></circle>
      <circle class="dot"  cx="${x}" cy="${y}" r="3"></circle>
      <text x="${x + 6}" y="${y + 3}">${name}</text>
    `;
    nodes.appendChild(g);
  });

  // Coord readout
  if (coords) {
    svg.addEventListener('mousemove', (e) => {
      const r = svg.getBoundingClientRect();
      const sx = (e.clientX - r.left) * (1000 / r.width);
      const sy = (e.clientY - r.top)  * (500  / r.height);
      const lon = (sx / 1000) * 360 - 180;
      const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * sy / 500))) * (180 / Math.PI);
      coords.textContent =
        `LAT: ${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}   LON: ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;
    });
    svg.addEventListener('mouseleave', () => {
      coords.textContent = 'MOVE CURSOR OVER MAP — LAT: —  LON: —';
    });
  }
})();

/* ─────────────────────────────────────────────────────────────────────────────
   IMPROVEMENT #4 — Art Gallery
   (a) Custom directional cursor (← / →) replacing default — color = accent
   (b) 3D tilt per card with cursor-tracking glare overlay
   Plus drag-to-scroll + wheel translation for horizontal browsing.
───────────────────────────────────────────────────────────────────────────── */
const ART = [
  { id: 1, src: 'images/art-01.jpg', title: 'FORM STUDY I',     medium: 'Oil on Canvas', year: 2024 },
  { id: 2, src: 'images/art-02.jpg', title: 'COMPOSITION II',   medium: 'Mixed Media',   year: 2024 },
  { id: 3, src: 'images/art-03.jpg', title: 'LANDSCAPE III',    medium: 'Oil on Canvas', year: 2024 },
  { id: 4, src: 'images/art-04.jpg', title: 'FIGURE IV',        medium: 'Acrylic',       year: 2024 },
  { id: 5, src: 'images/art-05.jpg', title: 'ABSTRACTION V',    medium: 'Oil on Canvas', year: 2024 },
  { id: 6, src: 'images/art-06.jpg', title: 'TEXTURE VI',       medium: 'Mixed Media',   year: 2024 },
  { id: 7, src: 'images/art-07.jpg', title: 'STILLNESS VII',    medium: 'Oil on Canvas', year: 2023 },
  { id: 8, src: 'images/art-08.png', title: 'KURUKAFA',         medium: 'Graphite',      year: 2022 },
  { id: 9, src: 'images/art-09.jpg', title: 'SPRING WORK',      medium: 'Mixed Media',   year: 2023 },
  { id: 10,src: 'images/art-10.jpg', title: 'DOG PORTRAIT',     medium: 'Watercolor',    year: 2026 },
  { id: 11,src: 'images/art-11.jpg', title: 'TIGER MURAL',      medium: 'Mural',         year: 2026 },
  { id: 12,src: 'images/art-12.jpg', title: 'MAN WITH GLASSES', medium: 'Watercolor',    year: 2026 }
];

(function artGallery() {
  const track  = document.getElementById('art-track');
  const vport  = document.getElementById('art-viewport');
  const cursor = document.getElementById('art-cursor');
  const bar    = document.getElementById('art-progress-bar');
  if (!track || !vport) return;

  // ── Render cards ────────────────────────────────────────────────────────
  ART.forEach((a, i) => {
    const card = document.createElement('div');
    card.className = 'art-card';
    card.setAttribute('data-screen-label', `art card ${i + 1} ${a.title}`);
    card.innerHTML = `
      <div class="frame">
        <img src="${a.src}" alt="${a.title}" loading="lazy" draggable="false">
        <div class="glare"></div>
        <div class="tag">${String(i + 1).padStart(2,'0')} · ${a.title}</div>
        <div class="meta">
          <div class="m1">${a.medium.toUpperCase()} · ${a.year}</div>
          <div class="m2">CLICK TO VIEW →</div>
        </div>
      </div>`;
    track.appendChild(card);
  });

  // ── Horizontal scrolling: drag + wheel ──────────────────────────────────
  let scroll = 0;
  let maxScroll = 0;
  let dragging = false;
  let dragStartX = 0, dragStartScroll = 0;
  let moved = false;

  function recalcMax() {
    maxScroll = Math.max(0, track.scrollWidth - vport.clientWidth);
  }
  function apply() {
    scroll = Math.max(0, Math.min(maxScroll, scroll));
    track.style.transform = `translate3d(${-scroll}px, 0, 0)`;
    if (bar) bar.style.width = (maxScroll > 0 ? (scroll / maxScroll) * 100 : 0) + '%';
  }

  // Images loading change scrollWidth — recalc on each load
  track.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', () => { recalcMax(); apply(); });
  });
  window.addEventListener('resize', () => { recalcMax(); apply(); });
  setTimeout(() => { recalcMax(); apply(); }, 80);

  // Wheel: vertical → horizontal
  vport.addEventListener('wheel', (e) => {
    const dy = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (dy === 0) return;
    scroll += dy;
    e.preventDefault();
    apply();
  }, { passive: false });

  // Drag
  vport.addEventListener('pointerdown', (e) => {
    dragging = true; moved = false;
    dragStartX = e.clientX; dragStartScroll = scroll;
    vport.setPointerCapture(e.pointerId);
  });
  vport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 4) moved = true;
    scroll = dragStartScroll - dx;
    apply();
  });
  function endDrag() { dragging = false; }
  vport.addEventListener('pointerup', endDrag);
  vport.addEventListener('pointercancel', endDrag);
  vport.addEventListener('lostpointercapture', endDrag);

  // Suppress click after drag
  vport.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

  // ── Improvement #4a — Custom directional cursor ─────────────────────────
  vport.addEventListener('pointerenter', () => { if (!REDUCED) cursor.classList.add('active'); });
  vport.addEventListener('pointerleave', () => cursor.classList.remove('active'));
  vport.addEventListener('pointermove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    const r = vport.getBoundingClientRect();
    const xrel = (e.clientX - r.left) / r.width;
    if (xrel < 0.5) {
      cursor.classList.add('flip');
      cursor.querySelector('.lbl').textContent = '← PREV';
    } else {
      cursor.classList.remove('flip');
      cursor.querySelector('.lbl').textContent = 'NEXT →';
    }
  });

  // Click L/R half → step
  vport.addEventListener('click', (e) => {
    if (moved) return;
    const r = vport.getBoundingClientRect();
    const xrel = (e.clientX - r.left) / r.width;
    const card = e.target.closest('.art-card');
    // If user clicked the image area near center: open lightbox-style step;
    // otherwise scroll horizontally.
    const step = vport.clientWidth * 0.6;
    if (xrel < 0.5) scroll -= step; else scroll += step;
    apply();
    if (card) {
      card.style.boxShadow = '0 0 0 2px var(--accent)';
      setTimeout(() => card.style.boxShadow = '', 350);
    }
  });

  // ── Improvement #4b — 3D card tilt + glare ──────────────────────────────
  track.querySelectorAll('.art-card').forEach(card => {
    const frame = card.querySelector('.frame');
    const glare = card.querySelector('.glare');
    card.addEventListener('pointermove', (e) => {
      if (REDUCED) return;
      const r = frame.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top)  / r.height;
      // Up to 8deg per spec
      const ry = (px - 0.5) *  16; // left↔right → rotateY
      const rx = (py - 0.5) * -16; // up↕down  → rotateX
      frame.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      // Glare follows the cursor
      glare.style.setProperty('--gx', (px * 100) + '%');
      glare.style.setProperty('--gy', (py * 100) + '%');
    });
    card.addEventListener('pointerleave', () => {
      frame.style.transform = '';
    });
  });
})();

/* ─────────────────────────────────────────────────────────────────────────────
   IMPROVEMENT #5 — Section counters (count-up via IntersectionObserver)
   Any [data-counter="N"] is animated from 0 → N over ~800ms, ease-out.
   Supports data-prefix, data-suffix, data-pad="2".
───────────────────────────────────────────────────────────────────────────── */
(function counters() {
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const targets = document.querySelectorAll('[data-counter]');
  if (!targets.length) return;

  const animate = (el) => {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const end = parseInt(el.dataset.counter, 10);
    if (isNaN(end)) return;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const pad    = parseInt(el.dataset.pad || '0', 10);
    const dur    = 820;
    const start  = performance.now();
    if (REDUCED) { el.textContent = prefix + String(end).padStart(pad, '0') + suffix; return; }
    function step(now) {
      const t = Math.min(1, (now - start) / dur);
      const v = Math.round(end * easeOut(t));
      el.textContent = prefix + String(v).padStart(pad, '0') + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) animate(e.target); });
  }, { threshold: 0.4 });

  targets.forEach(t => { t.textContent = (t.dataset.prefix || '') + '0'.padStart(parseInt(t.dataset.pad || '0', 10), '0') + (t.dataset.suffix || ''); io.observe(t); });
})();

/* ─────────────────────────────────────────────────────────────────────────────
   IMPROVEMENT #6 — Visitor Gallery
   (a) Submission error handling: wraps the fetch in try/catch, surfaces a
       styled error box with RETRY + DISMISS buttons.
   (b) Archive mosaic grid below the canvas tool, auto-fill minmax(160px).
───────────────────────────────────────────────────────────────────────────── */
(function visitorGallery() {
  const cv  = document.getElementById('draw');
  if (!cv) return;
  const ctx = cv.getContext('2d');

  // ── State ───────────────────────────────────────────────────────────────
  let tool = 'brush', color = '#222222', size = 8, drawn = false;
  let drawing = false;

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  // ── Tools ───────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-tool]').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('[data-tool]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      tool = b.dataset.tool;
      cv.style.cursor = tool === 'fill' ? 'cell' : 'crosshair';
    });
  });
  document.querySelectorAll('[data-size]').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('[data-size]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      size = parseInt(b.dataset.size, 10);
    });
  });
  document.querySelectorAll('[data-color]').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('[data-color]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      color = b.dataset.color;
      // switch back to brush automatically
      document.querySelectorAll('[data-tool]').forEach(x => x.classList.toggle('active', x.dataset.tool === 'brush'));
      tool = 'brush'; cv.style.cursor = 'crosshair';
    });
  });
  document.getElementById('btn-clear').addEventListener('click', () => {
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, cv.width, cv.height);
    drawn = false; updatePreview();
  });

  // ── Drawing ─────────────────────────────────────────────────────────────
  function getPos(e) {
    const r = cv.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - r.left) * (cv.width / r.width),
             y: (src.clientY - r.top)  * (cv.height / r.height) };
  }

  function hexToRgb(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
  function flood(cx, cy) {
    const img = ctx.getImageData(0, 0, cv.width, cv.height);
    const d = img.data, W = cv.width, H = cv.height;
    const i0 = (cy * W + cx) * 4;
    const tr = d[i0], tg = d[i0+1], tb = d[i0+2], ta = d[i0+3];
    const fc = hexToRgb(color);
    if (tr === fc[0] && tg === fc[1] && tb === fc[2] && ta === 255) return;
    const stack = [cx + cy * W];
    const vis = new Uint8Array(W * H);
    while (stack.length) {
      const p = stack.pop();
      const x = p % W, y = (p / W) | 0;
      if (x < 0 || x >= W || y < 0 || y >= H || vis[p]) continue;
      const i = p * 4;
      if (d[i] !== tr || d[i+1] !== tg || d[i+2] !== tb || d[i+3] !== ta) continue;
      vis[p] = 1;
      d[i] = fc[0]; d[i+1] = fc[1]; d[i+2] = fc[2]; d[i+3] = 255;
      stack.push(p+1, p-1, p+W, p-W);
    }
    ctx.putImageData(img, 0, 0);
  }

  function start(e) {
    if (tool === 'fill') {
      const p = getPos(e);
      flood(Math.round(p.x), Math.round(p.y));
      drawn = true; updatePreview();
      e.preventDefault(); return;
    }
    drawing = true;
    const p = getPos(e);
    ctx.beginPath(); ctx.moveTo(p.x, p.y);
    e.preventDefault();
  }
  function move(e) {
    if (!drawing || tool === 'fill') return;
    const p = getPos(e);
    ctx.lineWidth   = size;
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    ctx.lineTo(p.x, p.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p.x, p.y);
    drawn = true; e.preventDefault();
  }
  function end() {
    if (!drawing) return;
    drawing = false; ctx.beginPath();
    updatePreview();
  }
  cv.addEventListener('mousedown', start);
  cv.addEventListener('mousemove', move);
  cv.addEventListener('mouseup', end);
  cv.addEventListener('mouseleave', end);
  cv.addEventListener('touchstart', start, { passive: false });
  cv.addEventListener('touchmove',  move,  { passive: false });
  cv.addEventListener('touchend',   end);

  function updatePreview() {
    const img = document.getElementById('preview-img');
    const empty = document.getElementById('preview-empty');
    if (drawn) {
      img.src = cv.toDataURL('image/jpeg', 0.6);
      img.style.display = 'block'; empty.style.display = 'none';
    } else {
      img.style.display = 'none'; empty.style.display = '';
    }
  }

  // ── Submission with graceful error handling ─────────────────────────────
  const errBox = document.getElementById('err-box');
  const errBody= document.getElementById('err-body');
  const retry  = document.getElementById('err-retry');
  const dismiss= document.getElementById('err-dismiss');
  const submit = document.getElementById('submit-btn');

  function showError(msg) {
    errBody.textContent = msg;
    errBox.classList.add('show');
  }
  function hideError() { errBox.classList.remove('show'); }
  dismiss.addEventListener('click', hideError);

  async function trySubmit() {
    hideError();
    const name = document.getElementById('inp-name').value.trim();
    const title= document.getElementById('inp-title').value.trim();
    if (!name)  { showError('Add your name first — even "Anonymous" works.'); return; }
    if (!title) { showError('Give your piece a title before transmitting.'); return; }
    if (!drawn) { showError('Draw something on the canvas first.'); return; }

    submit.disabled = true;
    const original = submit.textContent;
    submit.textContent = 'TRANSMITTING…';

    // Improvement #6a — gracefully catch fetch errors (incl. TypeError: Failed to fetch)
    try {
      const imageData = cv.toDataURL('image/jpeg', 0.45);
      // The production endpoint will go here. We hit a known-failing URL in
      // demo so the retry-flow can be exercised visually.
      const endpoint = window.__GALLERY_ENDPOINT__ || 'https://offline.invalid/submit';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, title, image_data: imageData })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Success path — push into archive locally so the user sees it
      archive.unshift({ name, title, image: imageData, date: new Date().toISOString() });
      renderArchive();
      // Reset
      document.getElementById('inp-name').value = '';
      document.getElementById('inp-title').value = '';
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, cv.width, cv.height);
      drawn = false; updatePreview();
    } catch (err) {
      // Map raw error types to user-friendly copy
      let msg;
      if (err instanceof TypeError) {
        msg = 'Failed to reach the archive server. Check your network connection and try again.';
      } else if (err.message && err.message.startsWith('HTTP')) {
        msg = `Server rejected the submission (${err.message}). Try again in a moment.`;
      } else {
        msg = `Submission failed: ${err.message || 'Unknown error'}.`;
      }
      showError(msg);
      // Save for retry
      lastAttempt = { name, title };
    } finally {
      submit.disabled = false;
      submit.textContent = original;
    }
  }

  let lastAttempt = null;
  submit.addEventListener('click', trySubmit);
  retry.addEventListener('click', () => { trySubmit(); });

  // ── Improvement #6b — Archive grid (with seeded sample submissions) ─────
  const archive = seedArchive();
  function seedArchive() {
    // Tiny inline SVGs as data-URLs so the demo always shows content.
    const makeSwatch = (bg, fg, glyph) => {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 390'>
        <rect width='600' height='390' fill='${bg}'/>
        <text x='300' y='220' text-anchor='middle' font-family='monospace' font-size='180' font-weight='800' fill='${fg}'>${glyph}</text>
      </svg>`;
      // utf8-safe data URL (allow unicode glyphs)
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    };
    return [
      { name: 'ZEYNEP K.',       title: 'GRID/01',         image: makeSwatch('#FFFFFF', '#222222', '◇'), date: '2026-04-12T09:00:00Z' },
      { name: 'AHMED Y.',        title: 'GOLDEN HOUR',     image: makeSwatch('#FFD700', '#222222', '☀'), date: '2026-04-11T15:30:00Z' },
      { name: 'MARIA L.',        title: 'TRANSMISSION',    image: makeSwatch('#0C0C0F', '#D6FF00', '◯'), date: '2026-04-10T22:00:00Z' },
      { name: 'KAAN B.',         title: 'NEON HEART',      image: makeSwatch('#FFFFFF', '#FF0055', '♥'), date: '2026-04-09T11:20:00Z' },
      { name: 'YUKI T.',         title: 'WAVE-FUNCTION',   image: makeSwatch('#2196F3', '#FFFFFF', '~'), date: '2026-04-08T08:00:00Z' },
      { name: 'PRIYA S.',        title: 'BLOOM',           image: makeSwatch('#FF69B4', '#FFFFFF', '✿'), date: '2026-04-07T14:40:00Z' },
      { name: 'ANONYMOUS',       title: 'X / X / X',       image: makeSwatch('#FFFFFF', '#222222', '×'), date: '2026-04-06T17:00:00Z' },
      { name: 'DANIEL R.',       title: 'COMET',           image: makeSwatch('#00E5FF', '#0C0C0F', '☄'), date: '2026-04-05T03:30:00Z' },
      { name: 'EMRE A.',         title: 'GRID STUDY',      image: makeSwatch('#0C0C0F', '#8A8A93', '#'), date: '2026-04-04T19:00:00Z' },
      { name: 'OLIVIA C.',       title: 'STAR FRAGMENT',   image: makeSwatch('#9C27B0', '#FFFFFF', '✦'), date: '2026-04-03T12:00:00Z' },
      { name: 'NOA G.',          title: 'CIRCUIT',         image: makeSwatch('#00C853', '#0C0C0F', '⌬'), date: '2026-04-02T20:00:00Z' },
      { name: 'LEYLA S.',        title: 'CALM',            image: makeSwatch('#FFCD94', '#222222', '◐'), date: '2026-04-01T09:30:00Z' }
    ];
  }

  function fmtDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' }).toUpperCase();
    } catch (_) { return ''; }
  }

  function renderArchive() {
    const grid  = document.getElementById('archive-grid');
    const count = document.getElementById('archive-count');
    if (!grid) return;
    grid.innerHTML = '';
    archive.forEach(it => {
      const t = document.createElement('div');
      t.className = 'archive-tile';
      t.innerHTML = `
        <img src="${it.image}" alt="${it.title}" loading="lazy">
        <div class="date">${fmtDate(it.date)}</div>
        <div class="ovl">
          <div class="t">${it.title}</div>
          <div class="a">— ${it.name}</div>
        </div>
      `;
      grid.appendChild(t);
    });
    if (count) count.textContent = String(archive.length).padStart(2, '0');
  }
  renderArchive();
})();

/* ─────────────────────────────────────────────────────────────────────────────
   Nav active state on scroll
───────────────────────────────────────────────────────────────────────────── */
(function navLinks() {
  const links = Array.from(document.querySelectorAll('.site-header nav a'));
  if (!links.length) return;
  const sectionMap = links.map(a => {
    const id = a.getAttribute('href').slice(1);
    return { a, el: document.getElementById(id) };
  }).filter(m => m.el);

  function update() {
    const y = window.scrollY + window.innerHeight * 0.35;
    let active = sectionMap[0];
    for (const m of sectionMap) {
      if (m.el.offsetTop <= y) active = m;
    }
    links.forEach(l => l.classList.remove('active'));
    if (active) active.a.classList.add('active');
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

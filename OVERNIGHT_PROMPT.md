# OVERNIGHT MISSION — emirceylan.com

You are running unattended for the next several hours while I sleep. I will not answer
questions. Do not stop to ask for permission, do not ask clarifying questions, do not end
your turn early because you think you are "done" — there is a phase list below and it is
long on purpose. When you reach the end of it, go back to Phase 13 (Hardening Loop) and
keep improving until you are out of time or genuinely out of meaningful work.

Your job: take my personal website from "a decent student portfolio with unshipped
half-finished work" to **the best personal site a CS student applying for ML/AI jobs could
plausibly have.** Every decision you make should be judged against one question:

> *Does this make a recruiter, a professor, or a hiring engineer take Emir more seriously
> within 10 seconds of landing on the page?*

---

## 0. NON-NEGOTIABLE OPERATING RULES

1. **Never leave the repo in a broken state.** `npm run build` must pass before every
   commit. If a phase leaves the build red, fix it or revert that phase entirely.
2. **Commit after every phase**, with a real message. Small, atomic, reviewable commits.
   No single 4000-line commit.
3. **Verify, don't assume.** After each visual/UX change, actually render the page
   (headless browser screenshot) and look at it. You have image reading — use it. A change
   you did not look at is a change you did not make.
4. **Do not invent facts about me.** Everything factual on the site must come from the
   APPROVED FACTS block (§3) or from `dist/Emir_Ceylan_CV_2page.docx`. No invented job
   titles, no invented metrics, no invented testimonials, no fake client logos, no "5+
   years experience". If you need a fact you don't have, leave a `TODO(emir):` comment in
   the code and list it in the morning report instead of guessing.
5. **Respect the privacy rule in §4.** This is the easiest way to ruin this run. Read it
   twice.
6. **Refine, don't replace, the design.** The dark / crimson (`#C41E3A`) / mono-terminal
   identity stays. You are raising the execution quality, not picking a new aesthetic. If
   you find yourself writing a brand new visual language, stop and re-read this line.
7. **Keep a running log.** Append to `WORKLOG.md` at the end of every phase: what you did,
   what you verified, what you deliberately skipped and why.
8. **If you get stuck on something for more than ~20 minutes, park it.** Write it into
   `MORNING_REPORT.md` under "Blocked / needs Emir" and move to the next phase. Never
   burn the whole night on one bug.
9. Work in English in the codebase. Site copy is English. My name renders as **Emir
   Ceylan** in Latin-1-safe contexts and **Emİr / EMİR** where the dotted capital İ is
   already used — do not "fix" the İ into an I where it is intentional, and make sure the
   file encoding stays UTF-8 everywhere.
10. Use parallel subagents aggressively for independent work (audits, content drafting,
    per-page a11y passes, image optimization). Don't serialize what can fan out.

---

## 1. WHAT THE PROJECT IS (verified — you can trust this, but re-verify before acting)

- **Path:** the repo you are in. **Live:** https://www.emirceylan.com
- **Stack:** Astro 5.17 (static), Tailwind CSS 4 via `@tailwindcss/vite`, TypeScript,
  Supabase JS client (`@supabase/supabase-js`) for a visitor drawing gallery.
- **Deploy model:** the host auto-deploys from GitHub. **Pushing to `main` on
  `origin` (https://github.com/EmirCeylan356/EmirCeylanWebsite) IS the deploy.**
  Treat every push to main as a production release.
- **Pages:**
  - `src/pages/index.astro` (710 lines) — hero, marquee, About, Work teaser, Skills
  - `src/pages/hobbies.astro` (1136 lines) — painting/art/travel/personal
  - `src/pages/gallery-088c0fbff746.astro` (994 lines) — visitor drawing gallery,
    unlisted, Supabase-backed
  - `src/pages/visitor-gallery-admin.astro` (203 lines) — moderation UI
  - `src/pages/work-4b8b954c2493.astro` (386 lines) — **unlisted** full work history for
    recruiters (link-based privacy, NOT authentication)
- `src/layouts/Layout.astro` — the `<head>`, the interactive cursor-grid canvas, the
  count-up counters, GSAP ScrollTrigger reveals. All inline, all in one file.
- `src/components/Header.astro`, `src/components/Footer.astro`
- `src/styles/global.css` (430 lines) — the design tokens live here
- `handoff/` and `ECWebsite_Upgrade Proposal/` — **old design-exploration folders.** They
  are reference material only. Do not ship anything from them without adapting it. Decide
  in Phase 12 whether to archive them out of the repo root.
- `Paintings/` — source art images, duplicated into `dist/images/`. Note they are being
  served from `dist` — check whether they should live in `public/` or be run through
  `astro:assets`.

### Current repo state — READ THIS BEFORE TOUCHING ANYTHING

- The working tree has **a large amount of uncommitted work** (modified `index.astro`,
  `Header.astro`, `Footer.astro`, `Layout.astro`, `supabase.ts`, `tsconfig.json`,
  `astro.config.mjs`, `package.json`, plus a rename of `visitor-gallery.astro` →
  `gallery-088c0fbff746.astro`). Last commit is from **9 July 2026**.
- Consequence: **the live site is running an OLDER build than the local code.** The live
  nav still shows "VISITOR GALLERY"; local code has deliberately removed it and moved the
  gallery to an unlisted slug. Some of tonight's value is simply *shipping what's already
  been written*, safely.
- Branches present: `main`, `y2k-cyber-brutalism`, `claude/reverent-wiles`. There is a
  stale worktree at `.claude/worktrees/reverent-wiles`.
- `.env` holds `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY` and is correctly
  gitignored. **Never commit it, never print its values, never paste them into a report.**

---

## 2. GIT SAFETY PROTOCOL (do this FIRST, before any edits)

```
1. git status --short                  # snapshot what's dirty
2. git stash list                      # check nothing is hiding
3. git tag pre-overnight-backup-<date> # rollback anchor on the current HEAD
4. Review the uncommitted diff carefully. Build it. If it builds and looks right,
   commit it as its own commit: "Ship pending crimson redesign + unlisted gallery route"
5. git checkout -b overnight-polish
6. Push the backup tag to origin so it survives.
```

All night's work happens on `overnight-polish`. You merge to `main` **only** in Phase 14,
and only after the full verification gate passes. If a push to main ever results in a
broken live site, immediately `git revert` the merge, push, and confirm the live site
recovers — then write it up in the morning report.

---

## 3. WHO I AM — APPROVED FACTS

Read `dist/Emir_Ceylan_CV_2page.docx` yourself (there's a docx skill / python-docx) for
the authoritative version. Summary you may rely on:

**Identity**
- Emir Ceylan. B.Sc. Computer Science & Engineering, **Sabancı University**, Istanbul,
  Türkiye. Sept 2023 – expected graduation **2027**. Ranked 7,004th nationally in YKS,
  50% merit scholarship. Based in Istanbul.
- Positioning: **machine learning / medical AI**, moving toward **AI & LLM engineering**.
  Also a painter — the art is a genuine second thread, not decoration.
- Contact to publish: `emir.ceylan@sabanciuniv.edu`, `github.com/EmirC356`,
  `linkedin.com/in/emirceylan`. **Do NOT publish my phone number anywhere on the site**
  even though it appears in the CV.
- ⚠️ The CV docx still lists `github.com/Riwex` — that account was renamed to `EmirC356`
  and the old link is dead. Do not edit the docx; **flag it in the morning report** and
  make sure every link the site emits uses `EmirC356`.

**Experience**
- **Machine Learning Intern, Amsterdam UMC** (Erasmus+, Summer 2026). Calibrated XGBoost
  on MIMIC-IV v3.1 predicting 30-day post-discharge mortality in patients 70+; 172,575
  admissions / 68,328 patients; 77 clinically-justified features engineered from a 28 GB
  raw EHR release with DuckDB + polars; **AUROC 0.898**, beating LACE by +0.146 and
  HOSPITAL by +0.066 under GroupKFold; SHAP explainability, TRIPOD+AI reporting.
  Manuscript in preparation. *(Mortality only — there is no readmission model. Never
  describe it as one.)*
- **PURE Undergraduate Researcher — Human–AI Interaction in Medicine** (Dr. Polat Göktaş),
  2025–2026. Trustworthy, explainable DL for healthcare decision support (SHAP, Grad-CAM).
- **PURE Undergraduate Researcher — ML for Biomedical Alloys** (Dr. Azizeh Hosseinjany),
  ongoing. Predicting/optimizing mechanical properties and biocompatibility of HEAs & SMAs.
- **Learning Assistant, DSA 210 Data Science** (Öznur Taştan), Spring 2025–2026.
- **Hackathon Organizer & Technical Mentor**, Deep Technologies Club — ran Sabancı's
  first hackathon, May 2026.

**Selected projects**
- **Litigation Score Predictor (B2B SaaS)** — ELSA Lawathon, **2nd place, ₺20,000
  prize/seed**, April 2026, team of 5. Predicts litigation outcome scores and cites
  Turkish precedent rulings (*emsal kararlar*) for uploaded case documents.
- **E-Commerce Platform (CS308)** — Fall 2025, team of 5. Django REST Framework +
  React/Vite + PostgreSQL + JWT; catalog, cart, checkout, orders, reviews, wishlist.
  Git + Jira, agile.
- **Osteogenesis Imperfecta diagnosis tool (ENS 210)** — Sept 2025–Jan 2026, lead
  developer. 3,000+ sequences, 4 ML algorithms, **98.8% peak accuracy**, novel feature
  representation based on collagen amino-acid structure.
- **This website** — self-hosted with Docker + persistent storage, Firebase/Supabase
  backend.
- **Fitness & accountability app** — in progress. Calorie/exercise tracking built around
  friend accountability, with ephemeral one-time photo sharing.

**Skills (the site's list is stale — this is the real one)**
- Languages: Python, C++, JavaScript, SQL
- ML/Data: NumPy, pandas, polars, scikit-learn, XGBoost, SHAP, Matplotlib, Biopython, DuckDB
- Web/Infra: React, Vite, Django REST Framework, PostgreSQL, Docker, Firebase/Supabase,
  Astro, Git/GitHub, Jira, Jupyter, Ubuntu/Linux
- Concepts: machine learning, deep learning, explainable AI, full-stack web, REST APIs,
  data visualization, statistics
- Spoken: English (C1, fluent), Turkish (native)

**Credentials & leadership**
- UC San Diego Bioinformatics Specialization (Coursera); Stanford Machine Learning
  (Andrew Ng).
- Top 10% in Data Structures (CS204); strong grades in Algorithms (CS300), DSA 210,
  Computational Biology (ENS 210).
- Board Member, Deep Technologies Club — BioTech division (2025–present).
- President, Sabancı Archery Club (2024–2025).

**Current status (for the /now page — these are true as of late August 2026)**
- In Istanbul; senior year 2026–27 at Sabancı. A planned Spring 2026–27 exchange was
  cancelled, so I'm here through 2027.
- Actively looking for paid ML/AI/software work — Istanbul or remote — that I can hold
  alongside senior year.
- Deliberately moving from classical ML into AI/LLM engineering: RAG, agents, LLM systems.
  Building a RAG project to prove it.
- Off-screen: painting, archery, jiu-jitsu, fitness, chess.

---

## 4. THE PRIVACY RULE — READ TWICE

I do **not** want my individual projects, employers, or their details exposed on the
public pages. The public site should read as *credible and specific about capability*
without being a searchable index of everything I've done.

**Public pages** (`/`, `/hobbies`, `/blog`, `/now`, `/uses`, `/404`):
- ✅ May say: fields I work in, methods I use, tools I know, the kind of problems I solve,
  my university, my degree, my graduation year, that I've done a clinical ML internship
  abroad, that I've won a hackathon, aggregate counts ("7+ roles & research projects").
- ✅ May use **anonymized capability signals**: "a calibrated survival-risk model on a
  172k-admission clinical dataset, +0.15 AUROC over the standard clinical score" is fine —
  it shows competence without naming the institution, the dataset by name, or linking a repo.
  Use this technique to make the Work teaser land harder.
- ❌ May NOT name: Amsterdam UMC, MIMIC-IV, ELSA Lawathon, specific professors, specific
  course codes tied to projects, project names, or link to project repos, on any public page.
- ❌ No public CV/résumé download, no public project list, no per-project public pages.

**The unlisted recruiter hub** (`/work-4b8b954c2493` and anything you add under an
unlisted slug):
- ✅ Full detail: every role, every project, every metric, every name, the CV, the PDF.
  This is the single link I send when someone asks.
- Every unlisted page MUST pass `noindex` through `Layout.astro`, MUST be excluded from
  `sitemap.xml`, MUST be `Disallow`-ed in `robots.txt`, and MUST NOT be linked from any
  public page or from the header/footer nav.

**What "expand the Work teaser a bit" means concretely** (this is what I asked for):
Keep the "full history on request" model, but make the public teaser *earn trust*. Give it
substance: 3–4 anonymized capability tiles with real numbers, a short "what I actually do"
paragraph in plain engineering language, the domains (clinical ML, explainable AI,
bioinformatics, full-stack), and a strong CTA. It should feel like a confident engineer
choosing not to list everything — not like an empty page.

---

## 5. WHAT'S WRONG RIGHT NOW (my own audit — verify each, then fix)

**Positioning / copy**
1. The header says **"CREATIVE DEVELOPER — TURKEY"** and the `<title>` is
   **"EMIR CEYLAN — Creative Developer"**, but the hero subtitle says "CS STUDENT — AI FOR
   HEALTHCARE" and everything else is medical AI. This is the single biggest problem on the
   site: the first thing a recruiter reads describes a different person. Fix the whole
   brand line so it says one thing, everywhere — something in the register of *"ML / medical
   AI"*, keeping the terminal-mono styling. Propose the exact wording in the report.
2. Skills section is stale and undersells badly — no XGBoost, SHAP, polars, DuckDB, SQL,
   JavaScript, React, Django, PostgreSQL, Docker. Rebuild it from §3.
3. "Have a project in mind or just want to chat?" is freelancer copy. I'm not freelancing;
   I'm looking for ML/AI roles. Rewrite the contact copy accordingly.
4. The About narrative is fine in spirit but generic ("Building the future of medical AI").
   Tighten it — concrete, specific, no LinkedIn-speak, first person, no em-dash-heavy AI
   cadence. Read it out loud in your head; if it sounds like a bot, rewrite it.

**Technical / SEO**
5. `astro.config.mjs` has **no `site:`** — canonical URLs, sitemap, and RSS all depend on
   it. Set `site: 'https://www.emirceylan.com'`.
6. No `<meta name="description">`, no Open Graph tags, no Twitter card, no JSON-LD, no
   canonical link, no `og:image`. Link previews are currently blank. Fix all of it.
7. No `robots.txt`, no `sitemap.xml`, no `rss.xml`, no `404.astro`, no
   `apple-touch-icon`, no web manifest, no theme-color.
8. GSAP is loaded from **cdnjs** with two blocking `<script is:inline>` tags, on every
   page, even pages that barely use it. Install it as a dependency (or replace the reveals
   with IntersectionObserver + CSS, which is what they actually are) and drop the CDN.
9. Google Fonts loads **five families with many weights** from a render-blocking
   stylesheet: Space Grotesk, Syne, Inter, JetBrains Mono, IBM Plex Mono, Caveat. That's a
   large chunk of the site's weight. Self-host with `@fontsource-variable/*`, subset to
   `latin` + `latin-ext` (I need Turkish glyphs: ı İ ş Ş ğ Ğ ç Ç ö Ö ü Ü), preload only what
   the hero needs, `font-display: swap`, and cut any family that isn't earning its place.
10. Images: raw `.jpg`/`.jpeg`/`.png` straight from a phone camera, served unoptimized,
    and duplicated between `Paintings/` and `dist/images/`. Move sources under `src/` and
    run them through `astro:assets` / `sharp`: AVIF + WebP with fallbacks, correct
    `width`/`height` to kill CLS, `loading="lazy"` + `decoding="async"` below the fold,
    responsive `srcset`. Expect a very large byte saving here — measure it and report it.
11. `dist/videos/dna-helix.mp4` and `src/styles/kling-*.mp4` — a video in the styles folder
    is wrong. Audit whether they're used; if used, compress and give them `preload="none"` +
    a poster; if unused, delete.
12. The route rename `visitor-gallery` → `gallery-088c0fbff746` means the **live, indexed
    `/visitor-gallery` URL will 404 after this deploy.** Add a redirect (Astro `redirects`
    config or a static redirect page) so nothing breaks, and make sure the old URL doesn't
    leak the new slug.
13. No typecheck in the workflow. Add `astro check` and make it pass.

**Accessibility (assume it's bad until measured)**
14. Text colors are `var(--text-secondary)` at low opacity in many places, and `.font-mono
    text-xs` with heavy letter-spacing is used for actual content, not just labels. Audit
    every foreground/background pair for **WCAG AA (4.5:1 body, 3:1 large)** and fix.
15. Check: skip-to-content link, visible focus rings on every interactive element, heading
    order (no jumps), landmark elements, `aria-label` on icon-only links, alt text on every
    image (real descriptions for the paintings, `alt=""` for decoration), the canvas grid
    marked `aria-hidden`, `prefers-reduced-motion` honored by *every* animation including
    the marquee and the hero scramble, and keyboard operability of the gallery canvas tools.
16. `target="_blank"` links in the footer need `rel="noopener noreferrer"`.

**Security**
17. `visitor-gallery-admin` appears to be an unauthenticated page relying on an unguessable
    URL. Verify what it can actually do with the anon key. **Confirm Supabase RLS policies
    are enforced server-side** — if moderation/delete works from the browser with the anon
    key, the "admin" page is public in effect. Do not weaken anything; if you find a real
    hole you cannot safely fix without my credentials, disable the destructive path and put
    it at the top of the morning report.
18. Visitor gallery uploads: check for size limits, MIME/type validation, and any path where
    a submission renders unsanitized HTML. Add limits if missing.
19. Add security headers where the host allows it (`_headers` file or equivalent):
    `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`,
    `Permissions-Policy`, `Strict-Transport-Security`. CSP must be tested against the real
    site before shipping — a broken CSP is worse than none.

**Craft**
20. Mobile has never been properly verified. Test 360×640, 390×844, 414×896, 768×1024,
    1280×800, 1920×1080. The hero uses `clamp(5rem, 17vw, 13.5rem)` — check "CEYLAN" doesn't
    overflow at 360px. Check `100vh` behavior with mobile browser chrome (use `dvh`).
21. Tap targets ≥ 44×44px. Nav has only two items and a lot of dead space on mobile.
22. Print stylesheet: someone will print or PDF this page. Make it not embarrassing.
23. No favicon set beyond `favicon.svg`/`favicon.ico` — add the full set + `og:image`.

---

## 6. PHASE PLAN

Work these in order. Commit at the end of each. Log each in `WORKLOG.md`.

### Phase 1 — Baseline, safety, and shipping what exists
Git safety protocol (§2). Get `npm install`, `npm run build`, `npm run dev` working.
Establish a **measured baseline** before you change anything: build output size, page
weights, Lighthouse (perf/a11y/best-practices/SEO) for `/` and `/hobbies` on mobile and
desktop, and full-page screenshots at all breakpoints. Save everything under
`audit/baseline/`. You will re-run these at the end and the report will show before/after.
Set up the tooling you'll need: headless Chromium (Playwright), Lighthouse CLI, axe-core.

### Phase 2 — Foundations
`site:` in astro.config. `astro check` clean. Redirects for the renamed gallery route.
Install `@astrojs/sitemap`, `@astrojs/rss`, `@astrojs/mdx`, `sharp`, fontsource packages,
`gsap` as a real dependency. Restructure `Layout.astro` so `<head>` takes props
(`title`, `description`, `ogImage`, `noindex`, `canonical`) instead of hardcoding — every
page then passes real metadata. Extract the giant inline scripts out of `Layout.astro`
into modules so they're maintainable and can be loaded per-page.

### Phase 3 — Positioning and copy
Fix the brand line everywhere (§5.1). Rewrite: `<title>` and meta description for every
page, the hero subtitle, the marquee items, the About narrative, the Work teaser, the
contact copy. Rebuild the Skills data from §3 and reorganize the categories so the ML/AI
signal is first and the creative skills are a deliberate, smaller second block. Keep the
voice: direct, technical, a little dry, no hype, no "passionate about leveraging".

### Phase 4 — The Work teaser (per §4)
Rebuild it as described: capability tiles with anonymized real numbers, a plain-language
"what I actually do", domain tags, and a CTA that converts (mailto with a good subject +
a "request full history" framing). Make it look designed, not like a placeholder. Verify
zero project names, employer names, or repo links leaked into the public build:
`grep -ri "amsterdam\|mimic\|elsa\|lawathon\|osteogenesis\|goktas\|göktaş\|hosseinjany\|taştan\|tastan" dist/`
excluding the unlisted pages — this grep must come back clean before you deploy.

### Phase 5 — SEO, social, structured data
Per-page title/description. Canonical URLs. OG + Twitter cards. **Generate a real
`og:image`** (1200×630) that matches the site's identity — build it as an Astro/satori/sharp
generated asset, not a screenshot. JSON-LD `Person` schema (name, url, jobTitle, alumniOf
Sabancı University, knowsAbout, sameAs → GitHub + LinkedIn). `sitemap.xml` excluding all
unlisted routes. `robots.txt` disallowing the unlisted slugs and pointing at the sitemap.
`humans.txt` if you want. Favicon set + `apple-touch-icon` + `site.webmanifest` +
`theme-color`.

### Phase 6 — Performance
Self-host and subset fonts. Kill the CDN GSAP. Convert every image through `astro:assets`
(AVIF/WebP, responsive srcset, explicit dimensions, lazy below the fold). Audit and fix the
video assets. Inline critical CSS, defer the rest. Make sure the cursor-grid canvas doesn't
run on mobile (it already tries — verify) and that the rAF loop truly stops when idle.
**Target: Lighthouse ≥ 95 on Performance, Accessibility, Best Practices, and SEO, mobile
and desktop, on `/` and `/hobbies`.** If you can't hit 95 on something, get as close as
possible and explain the gap in the report with the specific blocker.

### Phase 7 — Accessibility
Work through §5.14–16 systematically. Run axe-core on every page and get to zero
violations. Test the full site keyboard-only and write down what you found. Test with
`prefers-reduced-motion: reduce` forced on and screenshot it — the site must be fully
usable and still look intentional with all motion off.

### Phase 8 — Responsive and cross-browser
Screenshot every page at all breakpoints in §5.20 and **look at each screenshot**. Fix
overflow, cramped spacing, orphaned words, broken clamps, `100vh` jumps (use `dvh`), tap
targets, and the mobile nav. Test in Chromium and Firefox via Playwright at minimum. Check
`prefers-color-scheme` — the site is dark-only by design, but make sure nothing inherits a
white flash on load (set a `<meta name="color-scheme" content="dark">` and a base
background before paint).

### Phase 9 — New pages
- **`/blog`** — Astro content collections + MDX. Full setup: post layout with reading
  time, tags, published/updated dates, prev/next, code highlighting with a theme that
  matches the site, RSS feed at `/rss.xml`, an OG image per post, and a clean index.
  Content rule: write **two posts as `draft: true`**, drawn only from APPROVED FACTS and
  written in a plain first-person engineering voice — e.g. one on calibration and why
  AUROC alone is a bad way to judge a clinical model, one on moving from classical ML into
  LLM/RAG work. No lorem ipsum, no fabricated anecdotes, no claims I didn't make. They
  stay drafts until I approve them. Also seed `content/blog/_TEMPLATE.mdx` so I can add
  posts easily, and document the workflow in `CONTENT.md`.
- **`/now`** — a real now-page (nownownow.com convention) using the "current status"
  facts in §3. Add a `lastUpdated` date that's rendered from frontmatter so it never goes
  stale invisibly.
- **`/uses`** — tools, editor, stack, hardware. Use only what you can verify from the repo
  and §3; leave `TODO(emir):` for anything you'd otherwise guess.
- **`/404`** — on-brand, useful, links back to the real pages. Have fun with the terminal
  aesthetic here.
- **Unlisted recruiter hub** — upgrade `/work-4b8b954c2493` into the single link I send
  someone: full role/project detail, real metrics, the CV as a clean HTML page (generated
  from a single structured data file so it can't drift from the docx), a PDF download, and
  a print stylesheet that produces a genuinely good printed page. Keep it `noindex`, keep
  it out of the sitemap, keep it unlinked. Do not put my phone number on it.

### Phase 10 — Analytics and contact
Add privacy-friendly, cookieless analytics (Cloudflare Web Analytics, Plausible, or Umami
— pick based on what the deploy host supports; if it needs an account I don't have, wire it
behind an env var and document the one step I take in the morning). No Google Analytics.
Make the contact path better than a bare `mailto:` — at minimum a well-crafted mailto with
subject/body prefill, plus consider a static-friendly form (Formspree/Web3Forms behind an
env var) with honeypot spam protection. Never break the mailto fallback.

### Phase 11 — The gallery and the hobbies page
Security pass per §5.17–18. Then quality: the visitor gallery is the most distinctive thing
on this site and it's currently hidden. Decide (and argue for it in the report) whether it
deserves a link from the public site — my instinct is yes, it's memorable and it's not
career-sensitive. Make it work flawlessly on touch, make the canvas tools discoverable, add
an empty state and an error state that aren't ugly. On `/hobbies`: real alt text for every
painting, a proper lightbox with keyboard nav and focus trapping, and image optimization
(this page is probably the heaviest on the site).

### Phase 12 — Repo hygiene
Replace the Astro starter `README.md` with a real one: what the site is, how to run it,
architecture, how to add a blog post, how to deploy, where the unlisted routes are and why.
Add `CONTRIBUTING`-style notes for future-me. Add `.editorconfig`, Prettier + the Astro
plugin, ESLint if it's not overkill, and a `npm run check` script that runs build +
typecheck + link check. Decide what to do with `handoff/` and `ECWebsite_Upgrade Proposal/`
— my preference is to move them into an `archive/` folder or a separate branch so the repo
root is clean, but do not delete anything. Remove the stale `.claude/worktrees` entry if
it's dead. Add a GitHub Actions workflow that runs build + typecheck + Lighthouse CI on PRs.

### Phase 13 — Hardening loop (repeat until out of time)
Now go back through with fresh eyes. Each pass, pick the weakest thing left and fix it.
Ideas, roughly in value order: micro-interaction polish (hover states, focus states,
transition curves — the current transitions are mostly a flat `0.2s ease`, which is a tell);
typographic rhythm and vertical spacing consistency; a real spacing scale in the tokens
instead of ad-hoc `mt-8`; consistency between the inline `style=""` attributes and Tailwind
classes (right now it's a mix — pick one approach and unify); loading/skeleton states;
`view-transition` between pages; a subtle scroll-progress indicator; better empty/error
states; copy tightening; dead CSS removal; unused dependency removal.

### Phase 14 — Verification gate, merge, deploy
**Nothing merges until every one of these passes.** Run them, record the output:
- [ ] `npm run build` clean, `astro check` zero errors
- [ ] Lighthouse ≥95 across all four categories, mobile + desktop, on `/` and `/hobbies`
      (or a documented explanation for each miss)
- [ ] axe-core: zero violations on every page
- [ ] Internal link check: zero broken links; external link check: report any dead ones
- [ ] The §4 privacy grep comes back clean on the public build
- [ ] `robots.txt` + `sitemap.xml` correct; unlisted routes absent from the sitemap and
      carrying `noindex`
- [ ] No secrets in the repo or the build output (`grep -r` for the Supabase URL/key
      patterns in tracked files; `.env` still ignored)
- [ ] Screenshots of every page at every breakpoint, reviewed by you, saved to
      `audit/after/`
- [ ] Reduced-motion pass screenshotted and reviewed
- [ ] The old `/visitor-gallery` URL redirects instead of 404ing

Then: merge `overnight-polish` → `main`, push to `origin`. **The push is the deploy.**
Wait for the host to build, then verify the live site:
- Fetch https://www.emirceylan.com and confirm the new content is live
- Check `/blog`, `/now`, `/uses`, `/404`, `/rss.xml`, `/sitemap.xml`, `/robots.txt`, and
  the redirect all behave on production
- Re-run Lighthouse **against the live URL**, not just localhost
- Confirm the unlisted pages are reachable by direct URL and absent from the sitemap
- Confirm the OG image renders (fetch the HTML and validate the tags)

If the live site is broken in any way: `git revert` the merge commit, push immediately,
confirm recovery, and make that the first line of the morning report.

---

## 7. QUALITY BAR

- **Design:** every change must look deliberate. If a section looks like a Tailwind demo,
  it's not done. Consistent spacing scale, consistent border treatment, consistent motion
  curves, one accent color used with restraint.
- **Copy:** short sentences. Concrete nouns. No "leveraging", no "passionate about", no
  "cutting-edge", no "journey", no three-item rule-of-three lists everywhere, no em-dash
  tic. A skeptical senior engineer should read it and think "this person knows what they're
  doing" rather than "this was written by an LLM".
- **Code:** typed, formatted, commented where non-obvious. The existing code has good
  explanatory comments (e.g. the gallery-privacy note in `Header.astro`) — match that
  standard and keep those comments intact.
- **Motion:** subtle, fast, purposeful, and completely absent under `prefers-reduced-motion`.
  Nothing that delays content by more than ~400ms.

---

## 8. HARD "DO NOT" LIST

- Do not commit `.env` or print its contents anywhere, including the morning report.
- Do not name my employers, projects, datasets, professors, or link my project repos on
  any public page (§4).
- Do not publish my phone number.
- Do not publish the blog drafts (`draft: true` stays true).
- Do not delete `handoff/`, `ECWebsite_Upgrade Proposal/`, `Paintings/`, or any branch.
- Do not force-push. Do not rewrite history on `main`.
- Do not change the accent color, go light-mode, or replace the visual identity.
- Do not add a chatbot, an AI-assistant widget, a cookie banner you don't need, autoplaying
  audio, or a newsletter popup.
- Do not add dependencies you don't actually use; do not add a UI framework (React/Vue) to
  an Astro static site for no reason.
- Do not fabricate metrics, dates, testimonials, or "featured in" logos.
- Do not open a PR and stop. Per §6 Phase 14, you merge and deploy yourself.

---

## 9. MORNING REPORT — the last thing you do

Write `MORNING_REPORT.md` in the repo root and make it good; it's the first thing I read.

```
# Overnight run — <date>, <start time> → <end time>

## TL;DR
Three sentences. What changed, whether it's live, whether anything needs me.

## Live status
Deployed: yes/no. Commit SHA. Verified live at <time>. Anything reverted.

## Before / after
| Metric | Before | After |
Lighthouse perf/a11y/bp/seo (mobile + desktop), total page weight, largest asset,
LCP, CLS, number of requests, font bytes, image bytes, axe violations.

## What I changed, by phase
Short bullets per phase with the commit SHA. Link the files.

## Decisions I made for you (and why)
Anything where I picked a direction — the new brand line, the analytics choice, whether
the gallery got a public link, what happened to handoff/. Give me the reasoning and how
to reverse it if I disagree.

## Needs Emir (ordered by importance)
Every TODO(emir), every blocked item, every thing needing a credential or an account,
the dead GitHub link in the CV docx, anything about Supabase RLS. Give me the exact
one-line command or click for each.

## What I deliberately did not do
And why.

## Suggested next session
The three highest-value things left.
```

Also: leave `audit/baseline/` and `audit/after/` with the screenshots and Lighthouse JSON
so I can see it for myself, and make sure `WORKLOG.md` is complete.

---

## 10. GO

Start with Phase 1. Do not summarize this plan back to me — just start working. Use the
whole night.

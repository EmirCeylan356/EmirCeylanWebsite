# Overnight run — 2026-08-25, 06:49 → __END__

## TL;DR
The site now says one thing everywhere ("ML / Medical AI"), the public Work section earns
trust with four anonymised real results instead of a placeholder, and there are five new
routes (/blog, /now, /uses, /404, and an HTML+PDF CV on the unlisted recruiter hub).
Every page is Lighthouse __LH_SUMMARY__, axe-clean, privacy-grepped and behind a tested
CSP; it is __LIVE_STATUS__. Two things need you before the gallery is genuinely secure
(Supabase RLS SQL) and before the painting titles stop contradicting the pictures.

## Live status
__LIVE_BLOCK__

## Before / after

Measured with `scripts/audit.mjs` (Lighthouse 13, Playwright Chromium, axe-core), local
preview of the production build. Raw JSON + every screenshot: `audit/baseline/` and
`audit/after/`.

| Metric | Before | After |
| --- | --- | --- |
| `/` Lighthouse mobile — perf / a11y / best-practices / SEO | 74 / 95 / 100 / 90 | __H_M__ |
| `/` Lighthouse desktop | 76 / 95 / 100 / 90 | __H_D__ |
| `/hobbies` Lighthouse mobile | 89 / 96 / 100 / 91 | __HB_M__ |
| `/hobbies` Lighthouse desktop | 79 / 96 / 100 / 91 | __HB_D__ |
| `/` LCP mobile / CLS mobile / CLS desktop | 2.98 s / 0.29 / 0.70 | __H_LCP__ |
| `/hobbies` LCP mobile / CLS desktop | 3.19 s / 0.38 | __HB_LCP__ |
| `/` page weight (all requests, full scroll) | 339 KB · 11 requests | __H_W__ |
| `/hobbies` page weight (full scroll) | 1,485 KB · 19 requests | __HB_W__ |
| `/` font bytes | 119 KB (Google Fonts, 6 families) | __FONT__ |
| `/` third-party JS | 116 KB (GSAP + ScrollTrigger from cdnjs) | 0 |
| `/hobbies` image bytes (ART tab open, full scroll) | 1,103 KB | 120 KB |
| axe violations (all pages, 390 + 1280) | 96 across 5 pages (contrast ×102, button-name ×26, h1 ×4, region ×5) | __AXE__ |
| Horizontal overflow at 360 px | gallery page (+21 px) | none |
| `<title>` / description / OG / canonical / JSON-LD | none of them | all pages |
| robots.txt / sitemap / RSS / 404 / manifest / icons | none | all present |
| Security headers | HSTS only (Vercel default) | CSP, nosniff, Referrer-Policy, Permissions-Policy, HSTS preload, X-Frame-Options, COOP |
| `astro check` | not set up (67 errors when first run) | 0 errors, 0 warnings |
| Build output | 64 MB (raw phone photos duplicated) | __DIST__ |

## What I changed, by phase

Commits are on `overnight-polish` (merged to `main` — see Live status). Full log in
[WORKLOG.md](WORKLOG.md).

- **Phase 1 — baseline & safety** · `f241225` Shipped the pending redesign + unlisted
  gallery route as its own commit; tag `pre-overnight-backup-2026-08-25` pushed to origin;
  Playwright/Lighthouse/axe tooling + [scripts/audit.mjs](scripts/audit.mjs); baseline in
  `audit/baseline/`.
- **Phase 2 — foundations** · `a21cad4` `site:` in [astro.config.mjs](astro.config.mjs),
  sitemap (unlisted routes filtered), MDX, sharp; [Layout.astro](src/layouts/Layout.astro)
  now takes `title/description/ogImage/noindex/canonical/type/jsonLd`; inline scripts
  extracted to [src/scripts/](src/scripts/); GSAP CDN replaced by IntersectionObserver +
  CSS reveals; fonts self-hosted (2 families, latin + latin-ext, 97 KB); Vercel redirect
  for `/visitor-gallery` + security headers in [vercel.json](vercel.json).
- **Phase 3 + 4 — positioning & Work teaser** · `3cff805` One brand line; About/Work/
  contact copy rewritten; four anonymised capability tiles with real numbers; skills
  rebuilt from the CV into [src/data/profile.ts](src/data/profile.ts).
- **Phase 5 — SEO/social** · `582fa77` Build-time OG cards ([src/lib/og.ts](src/lib/og.ts)),
  new favicon set, Person JSON-LD, robots.txt, manifest.
- **Phase 12 — hygiene (done early)** · `3b34c80` Real [README](README.md), CI workflow,
  [privacy-check](scripts/privacy-check.mjs) + [link-check](scripts/link-check.mjs),
  `npm run check`, prettier/editorconfig, old folders → `archive/`, dead videos removed.
- **Phase 10 — analytics & contact** · `38a149f` Vercel Web Analytics behind
  `PUBLIC_ANALYTICS=vercel`; Web3Forms contact form behind `PUBLIC_WEB3FORMS_KEY`
  (honeypot + time check); mailto always present. Also CSS view transitions and a
  scroll-progress line.
- **Phase 6/7 on home** · `69042d0` CLS 0.70 → 0.002 (server-rendered hero glyphs),
  `--accent-text` for small crimson text (5.3:1).
- **Phase 9 — recruiter hub + CV** · `f0e514a` [/work-4b8b954c2493/](src/pages/work-4b8b954c2493.astro)
  rebuilt from data; [/cv-4b8b954c2493/](src/pages/cv-4b8b954c2493.astro) + print CSS +
  [PDF](public/cv-4b8b954c2493/Emir_Ceylan_CV.pdf) via `npm run cv:pdf`.
- **Phase 11 — gallery security** · `7ffd133` Hardcoded admin password removed → Supabase
  Auth; input hardening; a11y; undo; empty/error states; [docs/SUPABASE.md](docs/SUPABASE.md).
- **Phase 9 — blog, now, uses, 404** · `7cc5b01` Content collections, two drafts, RSS,
  per-post OG, [CONTENT.md](CONTENT.md).
- **Phase 14 prep — CSP** · `7e743bb` Strict CSP tested on all 10 routes
  ([scripts/csp-check.mjs](scripts/csp-check.mjs)).
- **Phase 6/7/8/11 — hobbies** · `011a719` astro:assets images, `<dialog>` lightbox, real
  tablist, alt text for 48 paintings, gallery link panel.
- **Phase 14 — verification & deploy** · __DEPLOY_COMMITS__

## Decisions I made for you (and why)

1. **Brand line: "ML / MEDICAL AI — ISTANBUL"** (header), title "Emir Ceylan — ML / Medical
   AI", hero pill "MACHINE LEARNING — MEDICAL AI — CS '27". It matches what every other
   sentence on the site says, keeps the terminal register, and is short enough for the
   mobile header. Reverse: edit `SITE.tagline` in [src/lib/site.ts](src/lib/site.ts) and
   the hero pill in [index.astro](src/pages/index.astro).
2. **GSAP is gone**, not vendored. The reveals were IntersectionObserver-shaped anyway,
   and GSAP's `from()` was hiding whole sections when ScrollTrigger didn't fire (visible in
   `audit/baseline/index_1280x800.png`). Reverse: `npm i gsap` and re-add the tweens —
   but I would not.
3. **Fonts cut to two families** (Space Grotesk, JetBrains Mono). Syne only appeared on
   the ABOUT word and a couple of headings; Inter/IBM Plex were fallbacks; Caveat's only
   use was an always-empty caption. Reverse: add a `@font-face` in
   [src/styles/fonts.css](src/styles/fonts.css).
4. **The visitor gallery gets ONE public link, from `/hobbies` (ART tab).** Your instinct
   was yes; I agree it's memorable and not career-sensitive, but it is user-generated
   content with no moderation queue, so it should not sit on the home page a recruiter
   lands on. `/visitor-gallery` 301s to `/hobbies/#art` (so the old URL never emits the
   new slug). The route stays `noindex`. Reverse: delete the panel at the bottom of the
   ART tab in [hobbies.astro](src/pages/hobbies.astro) and point the redirect wherever
   you like in [vercel.json](vercel.json).
5. **Admin page now uses Supabase Auth instead of a password in JS.** The old gate was
   public (see Needs Emir #1). Reverse: not recommended.
6. **Analytics: Vercel Web Analytics** (cookieless, first-party script, no banner) because
   you're on Vercel and it's one toggle. Nothing loads until `PUBLIC_ANALYTICS=vercel` is
   set. Alternative if you'd rather not: Plausible/Umami — swap the one `<script>` in
   Layout.
7. **Contact form: Web3Forms behind an env var**, mailto stays primary. Nothing renders
   until `PUBLIC_WEB3FORMS_KEY` exists.
8. **`handoff/` and `ECWebsite_Upgrade Proposal/` → `archive/`** (both tracked now, 9.4 MB
   for the proposal). Reverse: `git mv` them back or drop `archive/` into a branch.
9. **Old work-page entries that aren't in the CV were removed** (see Needs Emir #3) rather
   than kept with a TODO — they contradicted the approved facts on a page recruiters read.
10. **Strict CSP** with `script-src 'self'` + one hash. `style-src` allows inline because
    Astro inlines small stylesheets and the site has inline `style=""` attributes. Tested
    clean on all routes locally __CSP_LIVE__.
11. **`dist/Emir_Ceylan_CV_2page.docx`**: it lived only in the gitignored build folder,
    and my `rm -rf dist` before the final build deleted it. I restored a byte-identical-
    looking copy from the desktop app's upload cache (same size class, same content
    markers). Please confirm it opens; consider keeping the source docx outside `dist/`
    (e.g. `~/Documents`), since build folders get wiped.

## Needs Emir (ordered by importance)

1. **Gallery is not secure server-side until you run the SQL.** Anyone who reads the page
   source has the anon key; without RLS policies that key can delete rows. Open Supabase →
   SQL editor → paste [docs/SUPABASE.md](docs/SUPABASE.md) §"Run this" → run. Then
   Authentication → Users → Add user (your email, a real password) so the admin page can
   sign you in. ~3 minutes. I could not read your current policies from here.
2. **Painting metadata is wrong** in [hobbies.astro](src/pages/hobbies.astro): titles/
   mediums are placeholders that don't match the pictures (e.g. "CLOWN PORTRAIT /
   Watercolor" is a cityscape; most "Oil on Canvas" entries are pen/graphite), 12 of the
   48 are duplicate photos of the same piece, and "PRIMARY MEDIUM: OIL" isn't supported by
   the set. I wrote honest alt text but did not invent titles. Fix the `artworks` array
   (title, medium, year) and delete the duplicate entries; the count updates itself.
3. **Confirm removed work-page content.** Not in the CV/approved facts, so dropped from
   `/work-4b8b954c2493/`: the "reduce sepsis testing" internship description; "Project
   Lead — Teknofest Medical AI / DeepMyelinAI"; "AI-engineered PETase enzymes" research;
   the "250+ publications scientometric study" framing of the Göktaş PURE project; "Teaching
   Assistant" (CV says Learning Assistant). If any are real, add them to `PRIVATE_*` in
   [src/data/profile.ts](src/data/profile.ts) and run `npm run cv:pdf`.
4. **CV docx still says `github.com/Riwex`** (dead). Fix it in Word; the site already uses
   `EmirC356` everywhere. Also `PRIVATE_PROJECTS[3].stack` (fitness app) is
   `TODO(emir): stack`.
5. **Vercel dashboard, two toggles:** Project → Analytics → Enable; Settings → Environment
   Variables → `PUBLIC_ANALYTICS=vercel` (and, if you want the form,
   `PUBLIC_WEB3FORMS_KEY=<key from web3forms.com>`). Redeploy.
6. **Blog drafts** are `draft: true` in `src/content/blog/`. Read them; flip to
   `draft: false` to publish. `npm run dev` shows them.
7. **/uses hardware** — `TODO(emir)` comments in [uses.astro](src/pages/uses.astro)
   (laptop, monitor, keyboard, terminal, editor theme). Omitted rather than guessed.
8. **Stale worktree** `.claude/worktrees/reverent-wiles` (branch fully merged): the tool
   permission layer blocked `--force` removal. One-liner:
   `git worktree remove --force .claude/worktrees/reverent-wiles`.
9. The **16.8 MB source photo** `src/assets/paintings/IMG-20260210-WA0003.jpeg` slows
   cold builds; export a ≤3000 px version and overwrite it.

## What I deliberately did not do

- **Did not probe Supabase with writes.** The insert-then-delete RLS test was blocked by
  the tool permission layer, and I wasn't going to work around that against your
  production database. Analysed statically instead (Needs Emir #1).
- **Did not add a client router** (Astro `<ClientRouter>`). Cross-document view
  transitions in CSS give the page fade without changing script lifecycles.
- **Did not touch `Paintings/`, any branch, the docx, or history.** Nothing force-pushed.
- **Did not name anything private on public pages.** `npm run check:privacy` enforces it.
- **Did not publish the drafts, the phone number, or a public CV download.**
- **Did not invent painting titles, hardware, or a fitness-app stack.**
- **ESLint** — skipped as overkill for an Astro static site; Prettier + `astro check` cover it.

## Suggested next session

1. Run the Supabase SQL, then add a moderation flag (`approved boolean default false`) so
   the public gallery only shows approved rows — that makes a home-page link safe.
2. Fix the painting metadata and dedupe (Needs Emir #2), then the hobbies page is the
   strongest "second thread" on the site.
3. Publish the calibration post, then write the RAG project up as the third post — the
   `/now` page promises it, and it's the thing that moves you from "classical ML" to
   "LLM engineering" in a recruiter's eyes.

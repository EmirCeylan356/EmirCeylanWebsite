# WORKLOG — overnight run, 2026-08-25

Running log, one entry per phase. Times are local (TST, UTC+3).

## Phase 1 — Baseline, safety, shipping what exists (06:49–07:00)
- Tagged `pre-overnight-backup-2026-08-25` on HEAD 1752329 and pushed the tag to origin.
- The dirty tree was smaller than described (5 files: Header/Footer/index/admin + the
  gallery route rename). Built it, reviewed the diff, committed as f241225
  "Ship pending crimson redesign + unlisted gallery route". Branched `overnight-polish`.
- Installed audit tooling as devDependencies: playwright (+chromium, firefox),
  @axe-core/playwright, lighthouse, chrome-launcher. Wrote `scripts/audit.mjs`
  (screenshots at 6 breakpoints × 5 pages, axe at 390/1280, page weight, Lighthouse
  mobile+desktop for / and /hobbies) and `scripts/shot.mjs` (single screenshot).
- Baseline saved in `audit/baseline/` (report.json + Lighthouse JSON + 35 PNGs).
  Headline numbers: / perf 74 (mobile) / 76 (desktop), CLS 0.29–0.70; /hobbies perf
  89/79, 1.49 MB over the wire; GSAP from CDN 116 KB, Google Fonts 119 KB; axe:
  colour-contrast on every page, `button-name` ×13 on the gallery, missing h1 on
  /hobbies and the work page.
- Verified by eye: the GSAP `from()` reveals left Work/Skills/Travels invisible in the
  full-page capture when ScrollTrigger didn't fire. Real bug, motivates Phase 2.
- Host is Vercel (response headers). `/visitor-gallery/` is live and returns 200.
- Supabase RLS probe (insert-then-delete a test row with the anon key) was blocked by
  the tool permission layer; analysed statically instead — see Phase 11 and the report.
- Skipped: nothing.

## Phase 2 — Foundations (07:00–07:10)
- `astro.config.mjs`: `site`, `@astrojs/sitemap` (filter drops the unlisted routes,
  /og/, /404), `@astrojs/mdx`, sharp image service. Astro-5-compatible majors
  (mdx@4, sitemap@3, rss@4, check@0.9) — latest majors target Astro 7.
- `vercel.json`: 301 `/visitor-gallery(/*)` → `/hobbies/#art` (edge redirect, no HTML
  that could leak the unlisted slug); security headers (nosniff, Referrer-Policy,
  Permissions-Policy, HSTS preload, X-Frame-Options, COOP); immutable caching for
  `/fonts/` and `/_astro/`. CSP deferred to Phase 14 after testing on the real site.
- `Layout.astro` rewritten: props `title/titleRaw/description/ogImage/noindex/canonical/
  type/publishedTime/modifiedTime/jsonLd/bodyClass`; canonical, OG, Twitter, Person
  JSON-LD (public pages only), color-scheme + theme-color, pre-CSS background paint,
  icons/manifest/RSS links, font preloads, skip link, `aria-hidden` on the decorative
  canvas/grid/vignette, `html.js` class for JS-gated hidden states.
- Inline scripts extracted to `src/scripts/{cursor-grid,counters,reveal,main}.ts`
  (typed). GSAP + ScrollTrigger CDN removed; reveals are now IntersectionObserver +
  CSS (`data-reveal`, `data-reveal-stagger`) with a no-JS fallback (content visible).
  Cursor grid now also pauses when the tab is hidden and debounces resize.
- Fonts self-hosted: Space Grotesk + JetBrains Mono variable, latin + latin-ext only
  (`src/styles/fonts.css`, files in `public/fonts/`, ~97 KB total, 3 preloaded).
  Dropped Syne, Inter, IBM Plex Mono, Caveat (Caveat's only use was an always-empty
  caption).
- `global.css`: motion tokens (`--ease-out`, `--dur-*`), spacing scale, `--text-tertiary`
  (lowest contrast allowed), focus-visible rings, `.skip-link`, `.sr-only`, global
  reduced-motion kill switch.
- `public/robots.txt`, `site.webmanifest`, `humans.txt`.
- Verified: `npm run build` green, sitemap-index.xml emitted, screenshots at 1280/390
  with zero console errors and zero horizontal overflow.
- Known: `astro check` still reports 67 errors, all in the old hobbies/work-page
  scripts — those pages are rebuilt in Phases 9 and 11, where the errors get fixed.

## Phase 3 + 4 — Positioning, copy, Work teaser (07:10–07:20)
- Brand line decided: **"ML / MEDICAL AI — ISTANBUL"** in the header, `<title>`
  "Emir Ceylan — ML / Medical AI", hero subtitle "MACHINE LEARNING — MEDICAL AI —
  CS '27". One message everywhere. Rationale in MORNING_REPORT.md.
- Marquee items are now domains, not job titles ("Medical AI Specialist" et al. were
  claims, not facts).
- About narrative rewritten in first person, concrete, no LinkedIn-speak.
- Work teaser: "what I actually do" paragraph, 5 domain tags, 4 anonymised capability
  tiles with real numbers (0.898 AUROC / 172k admissions / +0.15; 77 features / 28 GB;
  98.8% / 3,000+ sequences; 2nd place / ₺20k), CTA with a prefilled mailto subject.
  The old teaser's "Teknofest medical-AI team lead" line is gone — not in the approved
  facts.
- Skills rebuilt from §3 into `src/data/profile.ts` (`PUBLIC_SKILLS`): ML & data first,
  then languages, web & infra, concepts, a "learning now" LLM/RAG group; creative +
  spoken languages as the smaller second block.
- Footer: contact copy is now "looking for ML/AI/software roles", `rel="noopener
  noreferrer"` on external links, RSS link, 44px tap targets.
- `src/data/profile.ts` created as the single source of truth, split into PUBLIC_* and
  PRIVATE_* tiers with a `PRIVATE_TERMS` list for the build-time privacy grep.
- Verified: screenshots reviewed at 1280 and 390; no overflow; no console errors.

## Phase 5 — SEO, social, structured data (07:08–07:14)
- `src/lib/og.ts`: satori + resvg renderer for 1200×630 cards in the site's identity
  (grid, crimson glow, EC_ mark, mono labels). `src/pages/og/[page].png.ts` emits
  default/hobbies/now/uses/blog/404 cards at build time; blog posts get their own
  endpoint (Phase 9). Debugged a satori quirk: childless nodes must not carry
  `children: []`.
- New `favicon.svg` (EC_ mark; the old one was Astro's rocket), `apple-touch-icon.png`,
  `icon-192/512.png`, `favicon.ico` via `scripts/make-icons.mjs` (sharp).
- Per-page titles/descriptions/canonical/OG/Twitter/JSON-LD come from Layout (Phase 2).
  `robots.txt` disallows the four unlisted routes and points at `sitemap-index.xml`.
- Verified: looked at the rendered default.png and icon-192.png.

## Phase 12 — Repo hygiene (07:15–07:25, done early because it was independent)
- README rewritten (stack, run, architecture, routes + unlisted policy, content
  workflow, deploy, conventions). `.editorconfig`, `.gitattributes` (LF), Prettier +
  astro plugin, `.env.example`.
- `npm run check` = `astro check` + build + `scripts/link-check.mjs` +
  `scripts/privacy-check.mjs` (fails on private terms, phone numbers, unlisted slugs in
  public HTML, unlisted routes in the sitemap). `.github/workflows/ci.yml` runs it and
  Lighthouse CI (`lighthouserc.json`) on PRs.
- `handoff/` → `archive/handoff/`, `ECWebsite_Upgrade Proposal/` → `archive/upgrade-proposal/`
  (9.4 MB, now tracked). Nothing deleted.
- Removed the two unused videos (`public/videos/dna-helix.mp4`, `src/styles/kling-*.mp4`,
  3.5 MB each; nothing referenced them).
- Stale worktree `.claude/worktrees/reverent-wiles`: the branch is fully merged into
  main (0 commits ahead). `git worktree remove --force` was blocked by the tool
  permission layer (the worktree has a modified local settings file), so it is left in
  place and gitignored. One-liner for Emir in the report.

## Phase 10 — Analytics and contact (07:25–07:30)
- Analytics: Vercel Web Analytics (cookieless, no consent banner needed), injected by
  Layout only when `PUBLIC_ANALYTICS=vercel` and never on unlisted pages. Needs one
  toggle in the Vercel dashboard + the env var. No Google Analytics.
- Contact: the mailto now prefills subject + body. Added an optional Web3Forms form in
  the footer, rendered only when `PUBLIC_WEB3FORMS_KEY` is set: honeypot, 3-second
  minimum fill time, fetch submit with inline status, native POST + redirect without JS.
  Mailto fallback is always present.

## Phase 13 (early items) — Layout-level polish (07:30)
- Cross-document view transitions via `@view-transition { navigation: auto }` (pure CSS,
  no client router, so page scripts keep their simple run-once lifecycle). 140/220 ms fades.
- Scroll-progress line under the header using CSS scroll-driven animation
  (`animation-timeline: scroll(root)`): zero JS, hidden where unsupported and under
  reduced motion.

## Phase 9 (part) — Unlisted recruiter hub + CV (07:12–07:35, subagent)
- `/work-4b8b954c2493/` rebuilt from `src/data/profile.ts` (PRIVATE_* tier): intro +
  contact row, timeline of experience, project cards, education, credentials, skills.
  No hover-to-reveal, no popup; everything scannable. `noindex`, not in sitemap.
- `/cv-4b8b954c2493/` new: one-column CV from the same data (cannot drift), print
  stylesheet (`src/styles/print.css`, A4, 2 pages), Print/Save button, PDF download.
- `scripts/build-cv-pdf.mjs` prints the page with Playwright →
  `public/cv-4b8b954c2493/Emir_Ceylan_CV.pdf` (committed; Vercel has no Chromium).
- Removed content that is NOT in the approved facts and contradicts the CV — listed in
  the morning report for Emir to confirm or restore: the "sepsis testing" internship
  description, Teknofest/DeepMyelinAI project lead, PETase enzyme research, the
  "250+ publications scientometric study", the DSA 210 "Teaching Assistant" wording.
- Verified: astro check 0 errors in these files, axe 0 violations at 390/1280, built
  HTML has `noindex`, no phone number, no `Riwex`. Screenshots in audit/work/.

## Phase 11 (part) — Visitor gallery + admin security and quality (07:12–07:40, subagent)
- Security: the admin page's hardcoded password (`emir2026`, also accepted via
  `?password=`) was a decoration — the delete ran with the public anon key. Replaced
  with Supabase Auth email/password sign-in; delete only with a live session. Wrote
  `docs/SUPABASE.md` with the RLS policies + CHECK constraints Emir must run. Until
  he does, the anon key still permits delete — top of the morning report.
- Client hardening: length limits enforced in JS, blank-canvas rejection, 400 KB image
  cap with quality step-down, 30 s rate limit, honeypot, `data:image/(jpeg|png);base64,`
  validation before any `<img src>` (a `javascript:` row is dropped in the test), no
  `innerHTML` left; supabase-js from npm instead of the jsdelivr CDN.
- Quality: Pointer Events, roles/labels/`aria-pressed` on every tool, roving focus on the
  toolbar, UNDO (20 snapshots), one mosaic gallery with a native `<dialog>` lightbox,
  on-brand empty/error states, fullscreen reuses the same toolbar (fixed a z-index bug
  where the scroll-progress line drew over it), 0 horizontal overflow at 360.
- Decision: the gallery gets a public link from `/hobbies/` (ART tab) only — argued in
  the morning report. The old `/visitor-gallery/` URL 301s to `/hobbies/#art`.
- Verified: astro check clean, axe 0 violations across empty/error/grid/lightbox/
  fullscreen states at 390 and 1280; `scripts/gallery-check.mjs` kept as a regression
  test. Note: this machine's Chromium can't reach supabase.co (local TLS interception),
  so live-data captures show the error state; grid captures use mocked rows.

## Phase 9 (part) — Blog, /now, /uses, /404 (07:12–07:45, subagent)
- Content collection `blog` (Astro 5 glob loader, `_*` ignored) with `draft`; one shared
  filter (`src/components/blog/posts.ts`) governs index, post pages, tag pages, RSS and
  per-post OG so drafts can never leak in production. Drafts show in `npm run dev` and
  with `SHOW_DRAFTS=1`.
- Two draft posts written from approved facts only (calibration vs AUROC in a clinical
  risk model; moving from classical ML to LLM systems). `_TEMPLATE.mdx` + `CONTENT.md`.
- `/blog/` ships with an on-brand empty state (both posts are drafts), tag nav, RSS at
  `/rss.xml`. `BlogPost.astro`: reading time, dates, tags, prev/next, BlogPosting JSON-LD.
- `/now/` renders from `NOW` + `NOW_UPDATED` (2026-08-25) in profile.ts; `/uses/` only
  lists what the repo or §3 verifies (hardware left as TODO(emir) comments); `/404/`
  is a terminal panel listing the real routes, `H` goes home.
- Verified: build passes with drafts absent from HTML/RSS/OG; axe 0 violations on all
  four pages at 390/1280; screenshots reviewed.

## Phases 6 + 7 + 8 + 11 (hobbies) — Images, a11y, responsive (07:12–07:50, subagent)
- 48 painting sources moved `public/images/` → `src/assets/paintings/` and rendered
  with `<Picture>` (AVIF/WebP, 320–900w, q70, explicit dimensions, lazy + async).
  Page image bytes: **1,103,036 → 119,886** with the ART tab open (0 before opening,
  because inactive tab panels are now `hidden`). Worst case (whole wall + lightbox) 1.14 MB
  vs 1.10 MB baseline for a partial scroll.
- Native `<dialog>` lightbox with focus trap/restore, prev/next, arrow keys, n/48 counter.
  Cards are buttons. Data passed once as JSON; duplicated array removed.
- `ACTIVITIES` is the h1; tabs are a real `tablist` (arrow keys, roving tabindex);
  gallery viewport keyboard-scrollable; drag uses native `scrollLeft`; rAF loop idles;
  everything gated under reduced motion. Contrast fixes (`--text-tertiary`, white-on-
  crimson chips, `.glow-text` shadows dropped on this page). 0 overflow at 360→1920.
- Visitor gallery link panel under the ART tab: the deliberate single public entry point.
- Found for Emir (not changed — "don't add facts"): painting titles/mediums are
  placeholders that don't match the images; 12 duplicate pairs among the 48; the
  "oil painting" copy doesn't match the visible media; one 16.8 MB source photo.
- Verified: astro check 0 errors; axe 0 violations per tab + lightbox, normal and
  reduced motion; screenshots at 360/390/768/1280 reviewed. Removed 7 unreferenced
  photos and `travel-map.jpg` from `public/images/`.

## Phase 13 — Hardening pass 1 (07:20–07:45)
- Motion tokens (`--dur-*`, `--ease-out`) replace every ad-hoc `0.2s ease` in the files I
  rewrote (index, header, footer, layout); spacing tokens (`--space-*`, `--gutter`,
  `--section-y`) drive section rhythm on the home page and the new pages.
- `--accent-text` (#F0405E) for any crimson text under ~24 px: #C41E3A is only 3.4:1 on
  the base background. Applied to home, footer, /now, /404, blog links; `#C41E3A` stays
  for large type, borders and fills so the identity is unchanged.
- Zero-CLS hero: glyph spans server-rendered, widths locked before scrambling, text
  left-aligned in fixed boxes; typewriter reserves its final width. CLS 0.70 → 0.002.
- Cross-document view transitions + CSS scroll-progress line; contact form; footer
  tap targets. Strict CSP with hashed bootstrap; `assetsInlineLimit: 0`.

## Phase 14 — Verification gate (07:37–07:50)
- `npm run build` clean, `astro check` 0 errors / 0 warnings.
- Lighthouse (local production build): `/` 99/100/100/100 mobile, 100/100/100/100
  desktop; `/hobbies` 99/100/100/100 mobile, 100/100/100/100 desktop. CLS 0.009 / 0.002 /
  0 / 0. `audit/after/`.
- axe: 0 violations on all 10 routes at 390 + 1280 (one `/now` link contrast fixed
  before merge); reduced-motion pass screenshotted for /, /hobbies, /blog, /now.
- `scripts/link-check.mjs --external`: 0 broken internal, all 6 external reachable.
- `scripts/privacy-check.mjs`: clean (26 terms, 4 unlisted routes, phone pattern).
- Sitemap lists only /, /blog/, /hobbies/, /now/, /uses/; all four unlisted pages carry
  `noindex, nofollow`; robots.txt disallows them.
- `git grep` for Supabase URL / key patterns in tracked files: none; `.env` ignored.
- Screenshots of every page at 360/390/414/768/1280/1920 in `audit/after/`, reviewed.
- CSP tested clean on all routes with `scripts/csp-check.mjs`.
- Merged `overnight-polish` → `main` (825287b), pushed 07:50. Branch also pushed.

## Phase 14 — Live verification (07:58–08:05)
- Vercel "Deployment has completed" ~07:58. `scripts/verify-live.mjs`: 47/47 checks pass at 07:59.
- Lighthouse against https://www.emirceylan.com: `/` and `/hobbies` 100/100/100/100 mobile and desktop (`audit/live/`).
- First CI run on main failed only on the over-broad secrets grep (matched the CSP `*.supabase.co` wildcard); fixed in 321449f. Typecheck/build/links/privacy passed.

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

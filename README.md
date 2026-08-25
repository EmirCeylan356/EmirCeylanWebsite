# emirceylan.com

Personal site of Emir Ceylan: CS student at Sabancı University working on machine learning for healthcare, and a painter. Live at **https://www.emirceylan.com**.

Dark / crimson (`#C41E3A`) / mono-terminal identity. Static Astro site, no UI framework, hosted on Vercel, deployed automatically from `main`.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | [Astro 5](https://astro.build) (static output, content collections + MDX for the blog) |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite` + hand-written CSS with design tokens in `src/styles/global.css` |
| Fonts | Space Grotesk + JetBrains Mono, variable, self-hosted (`public/fonts/`, latin + latin-ext) |
| Images | `astro:assets` (sharp) → AVIF/WebP with responsive `srcset` |
| Social cards | Generated at build time with satori + resvg (`src/lib/og.ts`) |
| Visitor gallery | Supabase (`gallery_submissions` table) via `@supabase/supabase-js` |
| Hosting | Vercel — `vercel.json` carries redirects, security headers and cache headers |
| Analytics | Vercel Web Analytics, cookieless, enabled only when `PUBLIC_ANALYTICS=vercel` is set |

## Run it

```sh
npm install
npm run dev          # http://localhost:4321 (drafts visible)
npm run build        # static build → dist/
npm run preview      # serve dist/
npm run check        # typecheck + build + link check + privacy check (what CI runs)
```

Copy `.env.example` to `.env` for the gallery (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`). The site builds and runs without them; the gallery just shows a "not configured" state.

## Layout of the repo

```
src/
  pages/            routes (see "Routes" below)
  layouts/          Layout.astro (head, SEO, JSON-LD, skip link, background), BlogPost.astro
  components/       Header, Footer, blog/*
  content/blog/     MDX posts (+ _TEMPLATE.mdx)
  data/profile.ts   ← single source of truth for facts (PUBLIC_* / PRIVATE_* tiers)
  lib/              site.ts (constants, unlisted routes), og.ts (social cards), supabase.ts
  scripts/          client TS bundled by Astro: reveal, counters, cursor grid
  styles/           global.css (tokens, utilities), fonts.css, print.css
  assets/paintings/ source images for /hobbies (processed by astro:assets)
public/             static files: fonts, icons, robots.txt, manifest, CV PDF
scripts/            node tooling: audit, screenshots, icons, CV PDF, link + privacy checks
audit/              baseline/ and after/ Lighthouse + screenshots from the overnight upgrade
archive/            old design explorations (handoff/, upgrade-proposal/) — reference only
docs/               SUPABASE.md (RLS policies the gallery needs)
```

## Routes

Public: `/`, `/hobbies/`, `/blog/`, `/blog/<slug>/`, `/now/`, `/uses/`, `/404`, `/rss.xml`, `/sitemap-index.xml`, `/og/*.png`.

**Unlisted** (link-based privacy, *not* authentication — anyone with the URL can view):

| Route | Purpose |
| --- | --- |
| `/work-4b8b954c2493/` | Full work history for recruiters — the one link Emir sends on request |
| `/cv-4b8b954c2493/` | CV as HTML + printable; PDF at `/cv-4b8b954c2493/Emir_Ceylan_CV.pdf` |
| `/gallery-088c0fbff746/` | Visitor drawing gallery (linked only from `/hobbies/`) |
| `/visitor-gallery-admin/` | Moderation UI (Supabase Auth sign-in) |

Every unlisted route is `noindex`, excluded from the sitemap (`astro.config.mjs`), `Disallow`ed in `public/robots.txt`, and never linked from a public page or the nav. `scripts/privacy-check.mjs` fails the build if a public page mentions an employer, dataset, project, course code or professor name (list: `PRIVATE_TERMS` in `src/data/profile.ts`), links an unlisted slug, or contains a phone number.

**Why the split:** the public site should read as credible and specific about capability without being a searchable index of everything Emir has done.

## Editing content

- **Facts** (roles, projects, skills, /now): `src/data/profile.ts`. Public pages may only import `PUBLIC_*`.
- **Blog posts**: copy `src/content/blog/_TEMPLATE.mdx`. See [CONTENT.md](CONTENT.md).
- **CV**: edit `src/data/profile.ts`, then `npm run cv:pdf` and commit the regenerated PDF.
- **Paintings**: drop the image in `src/assets/paintings/` and add an entry (with real alt text) to the array in `src/pages/hobbies.astro`.
- **Icons**: edit `public/favicon.svg`, run `npm run icons`.

## Deploying

Push to `main` = production deploy on Vercel. Before merging:

```sh
npm run check                 # must be green
node scripts/audit.mjs after  # optional: Lighthouse + axe + screenshots into audit/after/
```

CI (`.github/workflows/ci.yml`) runs the same `check` plus Lighthouse CI on pull requests. Rollback: `git revert <merge-sha> && git push`.

## Conventions

- Keep the visual identity. Tokens live in `global.css`; use `--dur-*` / `--ease-out` for motion, `--space-*` for spacing, `--text-tertiary` as the lowest-contrast text colour (never `opacity` on text).
- Every animation must be off under `prefers-reduced-motion` (global kill switch + gate JS loops).
- Scroll reveals: `data-reveal` / `data-reveal-stagger`; content must be visible without JS.
- No facts on the site that aren't in `profile.ts`. Unknowns get a `TODO(emir):` comment, not a guess.
- Formatting: `npm run format` (Prettier + Astro plugin). `.editorconfig` is set.

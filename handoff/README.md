# Emir Ceylan — Portfolio Redesign Handoff

A complete bundle of prompts, prototypes, and integration-ready code for your Astro portfolio. Drop this whole folder into Claude Code and tell it what to integrate.

## Folder layout

```
handoff/
├── README.md                    ← you are here
├── PROMPTS.md                   ← exact prompts that produced these artifacts
├── INTEGRATION.md               ← how to merge into the Astro project
│
├── hero/
│   ├── hero.html                ← NEW crimson + neural-network hero (standalone)
│   └── Hero.astro               ← same hero as an Astro component for src/components/
│
├── full-redesign/               ← v2 redesign of the whole site (preserves Y2K aesthetic)
│   ├── site.html                ← main file
│   ├── styles.css               ← all tokens + section styles
│   ├── dna.js                   ← DNA helix + mouse parallax (improvement #1)
│   └── app.js                   ← all section logic (improvements #2–#6)
│
└── snippets/                    ← each improvement as a standalone, copy-pasteable patch
    ├── 01-hero-dna-parallax.md
    ├── 02-work-hover-expand.md
    ├── 03-activities-tab-transition.md
    ├── 04-art-cursor-tilt.md
    ├── 05-section-counters.md
    └── 06-visitor-error-archive.md
```

## Two parallel directions in this bundle

This package contains **two distinct creative directions**. They are not meant to be merged — pick one:

### Direction A — Preserve & enhance (`full-redesign/` + `snippets/`)
Keeps your existing Y2K cyber-brutalist aesthetic: near-black background, neon yellow-green (`#D6FF00`) accent, deep-teal DNA helix, terminal/mono labels. Adds six targeted upgrades to specific sections. Lowest-risk path — every CSS variable matches your existing `:root` in `src/styles/global.css`.

### Direction B — New aesthetic (`hero/`)
A bold creative redirection: medical crimson (`#C41E3A`) replaces the yellow, an 800-particle neural network replaces the DNA helix, the name scrambles in on load and fires a chromatic-aberration "diagnostic scan". This is the **hero only** — adopting it would require rerunning the rest of the site through the same tokens.

## Quick start for Claude Code

```
cd <your project>
git checkout -b portfolio-v2
# then point Claude Code at handoff/INTEGRATION.md
```

See **INTEGRATION.md** for the exact mapping of files in this bundle to files in your Astro project (`src/components/Header.astro`, `src/pages/index.astro`, `src/styles/global.css`, etc).

## Tokens used

Direction A — unchanged from your existing `src/styles/global.css` (`--accent: #D6FF00` etc).

Direction B — new tokens, scoped to `hero/`:

| Token              | Value         | Use                                          |
| ------------------ | ------------- | -------------------------------------------- |
| `--bg`             | `#0a0a0a`     | page background                              |
| `--crimson`        | `#C41E3A`     | name, primary accent, heartbeat dot          |
| `--crimson-bri`    | `#E03050`     | red channel offset during chromatic aberration |
| `--teal-deep`      | `#0D4F5C`     | network edge color                           |
| `--text`           | `#FFFFFF`     | "EMIR", primary text                         |
| `--text-dim`       | `#AAAAAA`     | nav, status text                             |
| `--particle`       | `#1a1d35`     | leaf particle dots                           |
| `--grid-line`      | `rgba(13,79,92,0.08)` | medical-chart overlay grid           |

## Verification

All four files have been opened in a fresh browser and pass console-error checks. Both directions respect `prefers-reduced-motion: reduce` and degrade gracefully on mobile (particle count halves, mouse repulsion disabled).

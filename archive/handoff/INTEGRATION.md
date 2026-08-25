# Integration guide

How to merge this bundle into your existing Astro project. Designed to be handed to Claude Code as a single instruction file.

## File mapping — Direction A (preserve & enhance)

| In this bundle                          | In your project                                  | Action                  |
| --------------------------------------- | ------------------------------------------------ | ----------------------- |
| `snippets/01-hero-dna-parallax.md`      | `src/layouts/Layout.astro` (DNA canvas script)   | Replace existing helix script with the parallax version, then drop the typewriter snippet into `src/pages/index.astro` hero section. |
| `snippets/02-work-hover-expand.md`      | `src/pages/index.astro` work-card markup + style | Add `.bullets` block to each card, add CSS rule to global.css. |
| `snippets/03-activities-tab-transition.md` | `src/pages/hobbies.astro` tab nav + script    | Replace tab-switching script + add `#tab-indicator` and panel transition styles. |
| `snippets/04-art-cursor-tilt.md`        | `src/pages/hobbies.astro` art gallery section    | Add `.art-cursor` element, replace mousemove handler on `.art-item`, add CSS for `.glare`. |
| `snippets/05-section-counters.md`       | `src/pages/index.astro` + `hobbies.astro`        | Drop the `[data-counter]` IntersectionObserver into `Layout.astro`, mark `/07` `/03` `/26` counts with `data-counter`. |
| `snippets/06-visitor-error-archive.md`  | `src/pages/visitor-gallery.astro`                | Wrap fetch in try/catch with retry UI, append archive grid markup + render function. |

## Suggested commit sequence

Each snippet is independent. Recommended order:

```
git checkout -b portfolio-v2

# 1. Lowest-risk visual polish first
git apply (snippet 05)        # counters
git commit -m "feat: count-up section counters"

git apply (snippet 02)        # work hover expand
git commit -m "feat: work cards reveal bullets on hover"

git apply (snippet 03)        # tab transitions
git commit -m "feat: animated tab indicator + fade transitions"

# 2. Bigger gestures
git apply (snippet 01)        # DNA parallax + typewriter
git commit -m "feat: mouse parallax on DNA helix, glitch typewriter"

git apply (snippet 04)        # art cursor + tilt
git commit -m "feat: directional cursor and 3D tilt in art gallery"

# 3. Bug fix
git apply (snippet 06)        # visitor gallery error handling + archive
git commit -m "fix: graceful submission errors; feat: archive mosaic"
```

## File mapping — Direction B (crimson neural hero)

This direction is **not yet ported to Astro**. If you choose to adopt it, the work is:

1. Copy `hero/Hero.astro` into `src/components/`.
2. In `src/pages/index.astro`, replace the entire `<section class="min-h-screen flex items-center …">` (the hero block) with `<Hero />`.
3. In `src/layouts/Layout.astro`, **delete** the DNA helix canvas + its script — the new hero owns its background.
4. Decide whether to retheme the rest of the site to the crimson palette, or leave the marquee-down content as-is (the existing yellow will then read as a section break).
5. Add Space Grotesk to your existing `<link>` font import in `Layout.astro`.

A minimal Astro version of the hero is already in `hero/Hero.astro` — it inlines its CSS in `<style is:scoped>` and its scripts in `<script is:inline>` so it stays self-contained.

## Things to ask Claude Code to confirm

- Does the chromatic aberration fire after CEYLAN finishes scrambling? (Listen for the `.aberrate` class toggle.)
- Does the heartbeat dot still render correctly on Safari? (Test `box-shadow` animation interpolation.)
- Are the work-card bullets accessible? (Currently `aria-hidden="true"` on the collapsed bullets — confirm screen readers still get the description text.)
- Does the visitor-gallery archive populate from real Supabase data once `__GALLERY_ENDPOINT__` is set? (Demo seeds inline SVGs; production should `await sb.from('gallery_submissions').select(...)`.)

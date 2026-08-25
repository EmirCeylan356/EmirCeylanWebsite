# Prompts used

These are the exact prompts that produced the artifacts in this bundle. Feed them back to Claude Code if you want to iterate on a particular direction.

---

## Prompt 1 — Six targeted improvements (Direction A)

> I need help improving specific interactive and visual elements of my personal portfolio website. Do NOT redesign from scratch — preserve the existing aesthetic completely and only enhance what's described.
>
> ### EXISTING DESIGN SYSTEM (preserve exactly)
> - Background: near-black (#0a0a0a or similar)
> - Primary accent: neon yellow-green (#CCFF00 or similar)
> - Secondary accent: deep teal (used in DNA helix background)
> - Typography: all-caps monospaced/grotesque display font for headings, monospace for body/labels
> - Terminal/cyberpunk aesthetic — system IDs, .exe labels, / counters (/07, /03)
> - Sections: HERO, ABOUT, WORK, ACTIVITIES (tabbed: sport/art/think), TRAVELS (interactive map), ART GALLERY (horizontal scroll), VISITOR GALLERY (live canvas + submission)
>
> ### REQUESTED IMPROVEMENTS — build each as a standalone component or code snippet
>
> **1. Hero — Mouse Parallax on DNA Helix.** Add a mousemove parallax effect: as the cursor moves across the viewport, the helix subtly shifts position on X and Y (max ~20px displacement, smooth with lerp/RAF). The helix should feel like it has depth — foreground strands move more than background strands if possible. Also add a glitch/typewriter loop to the "SYS_ID: EC_2027 — ISTANBUL / — ONLINE" status bar.
>
> **2. Work Cards — Hover Expand.** On hover: card border glows neon yellow, card expands slightly in height revealing 2-3 hidden bullet points (key achievements or tech used), with a smooth CSS transition. No JS framework needed — CSS only preferred but JS fine if needed.
>
> **3. Activities Tabs — Animated Content Transition.** The [SPORT] [ART] [THINK] tab switcher currently does an instant content swap. Replace with: active tab content fades out (opacity 0, translateY -8px, 150ms), then new content fades in (opacity 1, translateY 0, 200ms). Active tab indicator should slide horizontally between tabs rather than just toggling a class.
>
> **4. Art Gallery — Directional Cursor + 3D Card Tilt.**
> (a) Custom cursor: hide default cursor, replace with a directional arrow (← or →) that switches based on which horizontal half of the gallery the mouse is in. Style it in neon yellow.
> (b) On each image card: subtle 3D tilt using CSS perspective + JS mousemove — max 8deg rotation on X and Y axes, with a soft glare overlay that tracks cursor position. Reset smoothly on mouseleave.
>
> **5. Section Counters — Count-Up Animation.** When the section scrolls into viewport (IntersectionObserver), animate the number counting up from 00 to the final value over ~800ms with an ease-out.
>
> **6. Visitor Gallery — Submission Fix + Archive Grid.**
> (a) The canvas draw tool currently throws "TypeError: Failed to fetch" on submit. Provide a clean error handling wrapper that catches the error gracefully, shows a styled error message in the existing red box, and adds a retry button.
> (b) Below the canvas tool, add an archive mosaic grid that displays past submissions as small thumbnails in a CSS grid (auto-fill, minmax 160px). On hover: thumbnail scales up slightly and shows the artist name + title overlay in monospaced yellow text.
>
> ### TECHNICAL CONSTRAINTS
> - Vanilla JS or lightweight libraries preferred (no React)
> - No external CSS frameworks
> - Must work with the existing dark theme CSS variables
> - Animations should respect prefers-reduced-motion media query
> - All code should be modular — one self-contained snippet per feature

→ Produced: `full-redesign/site.html`, `styles.css`, `dna.js`, `app.js`, and the individual files in `snippets/`.

---

## Prompt 2 — Crimson neural hero (Direction B)

> Redesign the HERO section of my personal portfolio as a single self-contained HTML file. This is not an incremental improvement — treat it as a full creative direction change. Be bold, be cinematic, be precise.
>
> ### IDENTITY
> - Name: EMIR CEYLAN
> - Role subtitle: CS STUDENT — AI FOR HEALTHCARE
> - Status line: SYS_ID: EC_2027 — ISTANBUL / — ONLINE
> - Two CTA buttons: MY WORK (primary) | CONTACT (secondary)
> - Nav: EC logo top-left | CREATIVE DEVELOPER — TURKEY center | MAIN HOBBIES VISITOR GALLERY top-right
>
> ### COLOR SYSTEM
> - Background: #0a0a0a
> - Primary accent: #C41E3A (medical crimson — replaces all previous yellow)
> - Secondary: deep teal #0D4F5C for ambient glow and particle edges
> - Text: pure white for "EMIR", crimson for "CEYLAN"
> - All UI labels, nav, status text: off-white #AAAAAA monospaced
>
> ### TYPOGRAPHY
> - "EMIR": massive, white, same grotesque all-caps display font
> - "CEYLAN": same size or larger, #C41E3A crimson fill
> - On page load: both words assemble via character scramble — letters cycle through random uppercase chars for 1.2s before resolving. Use a 60ms stagger between letters.
> - After resolve: "CEYLAN" gets a chromatic aberration effect — red channel shifts left 4px, blue channel shifts right 4px for 600ms, then snaps back. Re-triggers on hover.
>
> ### BACKGROUND — NEURAL PARTICLE SYSTEM (Canvas2D)
> Replace the DNA helix entirely.
> - ~800 particles, floating slowly with slight random drift
> - Particles connect to neighbors within 120px distance with thin lines
> - On mousemove: particles within 150px radius are repelled from cursor, creating a disturbance wake. Smooth spring return when cursor leaves.
> - A few particles (~12) are larger, brighter teal — act as "hub nodes" with more connections. These pulse slowly (opacity 0.4 → 1.0, 3s cycle)
> - The whole field should feel like a neural network or cell culture under a microscope, not decorative geometry
>
> ### ACCENT DETAILS
> - ONLINE indicator dot: #C41E3A, animated with a slow box-shadow pulse (heartbeat rhythm — 1.5s ease-in-out infinite).
> - Background grid: very subtle vertical/horizontal lines at 8% teal opacity — like a medical chart overlay. Static, not animated.
> - "MY WORK" button: transparent background, #C41E3A border + text. On hover: fills solid crimson, text goes white. 300ms ease transition.
> - "CONTACT" button: plain text, white, underline appears on hover only.
> - Nav links: monospaced, #AAAAAA. On hover: color shifts to #C41E3A with a 1px underline. No bold, no movement.
>
> ### CINEMATIC LOAD SEQUENCE (total ~2s)
> 1. 0ms — particles fade in (800ms)
> 2. 200ms — grid lines appear (400ms)
> 3. 400ms — status bar types in left to right (600ms)
> 4. 600ms — "EMIR" scrambles and resolves (1.2s)
> 5. 700ms — "CEYLAN" scrambles and resolves (1.2s), then chromatic aberration fires once
> 6. 1400ms — subtitle fades up
> 7. 1600ms — CTA buttons fade in
> 8. All animations respect prefers-reduced-motion
>
> ### TECHNICAL
> - Single HTML file, vanilla JS + Canvas2D (no Three.js)
> - CSS custom properties for all colors
> - Fully responsive — on mobile, reduce particle count to 300, disable mouse repulsion
> - No external dependencies except Google Fonts (use Space Grotesk Bold or similar)

→ Produced: `hero/hero.html`.

---

## Prompt 3 — Network refinement (follow-up on Direction B)

> Can you make the background a bit more spread and make it look more like a neural network structure also make it darker so Hero text is a bit more prominent

→ Applied to `hero/hero.html`:
> - Particles redistributed from center-clustered to uniformly-spread across the viewport
> - Hub nodes promoted from 12 random to 22 placed on a spatial grid
> - Hub connection radius increased to 220px (vs 110px for leaf particles), plus dim long-range hub↔hub "axon" lines drawn underneath — gives the field real network topology
> - Soft radial vignette (45%×35% ellipse) behind the hero text darkens the title area without dimming the network at the edges

---

## Prompt 4 — Final dimming pass

> small change the particles light up too much maybe halve it and darken it a bit more

→ Halved edge & synapse opacities, dropped hub pulse range from `0.4→0.95` to `0.22→0.54`, shrank hub glow blur, darkened leaf particle base color, and deepened the central vignette ellipse by ~10pp.

/**
 * Site-wide constants. Single source of truth for identity strings that show
 * up in <head>, the header, JSON-LD, RSS, and the OG image generator.
 *
 * Facts here are limited to what is safe on PUBLIC pages (see the privacy
 * note in src/data/profile.ts for the public/private split).
 */
export const SITE = {
  url: 'https://www.emirceylan.com',
  name: 'Emir Ceylan',
  /** The one brand line, used verbatim in the header, title, and OG image. */
  tagline: 'ML / MEDICAL AI',
  /** Sentence-case version for meta descriptions and JSON-LD jobTitle. */
  role: 'Machine learning engineer in training, focused on medical AI',
  description:
    'Emir Ceylan is a Computer Science student at Sabancı University (class of 2027) working on machine learning for healthcare: calibrated clinical risk models, explainable AI, and bioinformatics. Moving into LLM and RAG systems.',
  email: 'emir.ceylan@sabanciuniv.edu',
  github: 'https://github.com/EmirC356',
  linkedin: 'https://www.linkedin.com/in/emirceylan',
  location: 'Istanbul, Türkiye',
  university: 'Sabancı University',
  gradYear: 2027,
  locale: 'en_US',
} as const;

/**
 * Unlisted routes. Link-based privacy, NOT authentication. These must:
 *  - render <meta name="robots" content="noindex, nofollow"> (Layout `noindex`)
 *  - be excluded from sitemap.xml (astro.config.mjs filter)
 *  - be Disallow-ed in robots.txt (public/robots.txt)
 *  - never be linked from a public page, the header, or the footer
 */
export const UNLISTED_PATHS = [
  '/work-4b8b954c2493/',
  '/cv-4b8b954c2493/',
  '/visitor-gallery-admin/',
  '/admin/',
] as const;

export const isUnlisted = (pathname: string) =>
  UNLISTED_PATHS.some((p) => pathname === p || pathname === p.replace(/\/$/, ''));

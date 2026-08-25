/**
 * ─────────────────────────────────────────────────────────────────────────
 *  PROFILE DATA — the single source of truth for facts about Emir.
 *
 *  Two tiers, and the split is the whole point:
 *
 *  PUBLIC_*  → safe on any public page (/, /hobbies, /now, /uses, /blog).
 *              Fields, methods, tools, university, degree, grad year, and
 *              ANONYMISED capability signals with real numbers. No employer,
 *              dataset, project, course-code, professor names, no repo links.
 *
 *  PRIVATE_* → only for unlisted routes (/work-4b8b954c2493, /cv-4b8b954c2493).
 *              Full detail. Never import these into a public page. The build
 *              is grepped for leaked names before every deploy (see
 *              scripts/privacy-check.mjs).
 *
 *  Source of truth for the facts: Emir's CV (dist/Emir_Ceylan_CV_2page.docx)
 *  and the approved-facts block in OVERNIGHT_PROMPT.md §3. Nothing here is
 *  invented; anything uncertain is marked TODO(emir).
 * ─────────────────────────────────────────────────────────────────────────
 */
import { SITE } from '../lib/site';
import content from './content.json';

export const contactMailto = (subject: string, body?: string) =>
  `mailto:${SITE.email}?subject=${encodeURIComponent(`${subject} — Emir Ceylan`)}` +
  (body ? `&body=${encodeURIComponent(body)}` : '');

// ══════════════════════════════════════════════════════════════════════════
//  PUBLIC
// ══════════════════════════════════════════════════════════════════════════

/** Aggregate count shown on the home page ("07+ roles & research projects"). */
export const roleCount = 7; // = PRIVATE_EXPERIENCE.length + hackathon win + OI tool; see below

// All PUBLIC copy lives in src/data/content.json (edited through the CMS at
// /admin). The constants below re-export it so existing imports keep working.
// Field-by-field docs: src/data/content.schema.md.

export interface Capability {
  label: string;
  metric: string;
  unit: string;
  description: string;
  stack: string;
}

export interface SkillGroup { title: string; items: string[]; note?: string }

export interface Stat {
  value: string;
  label: string;
  /** When set, the number counts up on scroll (data-counter). */
  counter?: number;
}

/** Shape of src/data/content.json. Keep in sync with public/admin/config.yml. */
export interface SiteContent {
  hero: { status: string; subtitle: string; ctaPrimary: string; ctaSecondary: string };
  /** Marquee bar items; the last one is rendered in the accent colour. */
  marquee: string[];
  about: { lede: string; paragraphs: string[]; stats: Stat[] };
  work: {
    eyebrow: string;
    lede: string;
    body: string;
    domains: string[];
    capabilities: Capability[];
    ctaEyebrow: string;
    ctaText: string;
    ctaPrimary: string;
    ctaSubject: string;
    ctaSecondary: string;
  };
  skills: { primary: SkillGroup[]; secondary: SkillGroup[] };
  contact: { eyebrow: string; title: string; copy: string; cta: string; mailSubject: string; mailBody: string };
  now: {
    updated: string;
    location: string;
    intro: string;
    /** status[0] = Where, [1] = Work, [2] = Learning, rest = Research. */
    status: string[];
    offScreen: string[];
    outro: string;
  };
}

export const CONTENT: SiteContent = content;

export const PUBLIC_DOMAINS: string[] = CONTENT.work.domains;

/** Anonymised, real numbers. Institution / dataset / project names omitted on purpose. */
export const PUBLIC_CAPABILITIES: Capability[] = CONTENT.work.capabilities;

export const PUBLIC_SKILLS: { primary: SkillGroup[]; secondary: SkillGroup[] } = CONTENT.skills;

/** Credentials that are fine to show publicly (no course codes tied to projects). */
export const PUBLIC_CREDENTIALS = [
  'UC San Diego Bioinformatics Specialization (Coursera)',
  'Stanford Machine Learning (Andrew Ng)',
  'Top 10% in Data Structures; strong grades in Algorithms, Data Science, Computational Biology',
  '50% merit scholarship (ranked 7,004th nationally in the YKS)',
];

/** /now page facts (from content.json → now). `updated` is bumped by the editor. */
export const NOW_UPDATED: string = CONTENT.now.updated;
export const NOW: SiteContent['now'] = CONTENT.now;

// ══════════════════════════════════════════════════════════════════════════
//  PRIVATE — unlisted routes only. Do not import from a public page.
// ══════════════════════════════════════════════════════════════════════════

export interface Experience {
  title: string;
  org: string;
  location?: string;
  period: string;
  kind: 'internship' | 'research' | 'teaching' | 'leadership';
  bullets: string[];
  stack?: string[];
  current?: boolean;
}

export const PRIVATE_EXPERIENCE: Experience[] = [
  {
    title: 'Machine Learning Intern',
    org: 'Amsterdam UMC',
    location: 'Amsterdam, Netherlands (Erasmus+)',
    period: 'Summer 2026',
    kind: 'internship',
    bullets: [
      'Built a calibrated XGBoost classifier on MIMIC-IV v3.1 predicting 30-day post-discharge mortality for patients aged 70+ (172,575 admissions from 68,328 patients), supporting advance-care-planning triage.',
      'Engineered 77 clinically justified features from the 28 GB raw EHR release with DuckDB and polars.',
      'Reached AUROC 0.898, beating the LACE and HOSPITAL clinical scores by +0.146 and +0.066 AUROC under GroupKFold validation, with strong calibration, SHAP explainability and TRIPOD+AI reporting.',
      'Manuscript in preparation.',
    ],
    stack: ['Python', 'XGBoost', 'DuckDB', 'polars', 'SHAP', 'scikit-learn'],
  },
  {
    title: 'Undergraduate Researcher (PURE) — Human–AI Interaction in Medicine',
    org: 'Sabancı University · Advisor: Dr. Polat Göktaş',
    period: '2025 – 2026',
    kind: 'research',
    bullets: [
      'Building trustworthy, explainable deep-learning models for healthcare decision support (SHAP, Grad-CAM).',
    ],
    stack: ['Python', 'PyTorch', 'SHAP', 'Grad-CAM'],
  },
  {
    title: 'Undergraduate Researcher (PURE) — Machine Learning for Biomedical Alloys',
    org: 'Sabancı University · Advisor: Dr. Azizeh Hosseinjany',
    period: 'Ongoing',
    kind: 'research',
    current: true,
    bullets: [
      'Developing an ML framework to predict and optimise the mechanical properties and biocompatibility of High-Entropy Alloys (HEAs) and Shape Memory Alloys (SMAs).',
    ],
    stack: ['Python', 'scikit-learn', 'pandas'],
  },
  {
    title: 'Learning Assistant — DSA 210 Data Science',
    org: 'Sabancı University · Supervisor: Öznur Taştan',
    period: 'Spring 2025 – 2026',
    kind: 'teaching',
    bullets: [
      'Mentored students in Python-based data-science workflows: exploratory data analysis and ML implementation with scikit-learn.',
    ],
    stack: ['Python', 'scikit-learn', 'pandas', 'Matplotlib'],
  },
  {
    title: 'Hackathon Organizer & Technical Mentor',
    org: 'Deep Technologies Club, Sabancı University',
    period: 'May 2026',
    kind: 'leadership',
    bullets: [
      "Helped organise and run Sabancı University's first hackathon; led the technical side and mentored participating teams throughout the event.",
    ],
  },
];

export interface Project {
  title: string;
  role: string;
  period: string;
  context?: string;
  award?: string;
  bullets: string[];
  stack: string[];
  link?: string;
  status?: 'in progress';
}

export const PRIVATE_PROJECTS: Project[] = [
  {
    title: 'Litigation Score Predictor (B2B SaaS)',
    role: 'ML Developer (team of 5)',
    period: 'April 2026',
    context: 'ELSA Lawathon (European Law Students’ Association)',
    award: '2nd place · ₺20,000 prize / seed funding',
    bullets: [
      'ML model that predicts litigation outcome scores and cites relevant precedent rulings (emsal kararlar) for case documents uploaded by companies and law firms, designed as a B2B SaaS product.',
    ],
    stack: ['Python', 'NLP', 'scikit-learn'],
  },
  {
    title: 'Osteogenesis Imperfecta (OI) Diagnosis Tool',
    role: 'Lead Developer',
    period: 'September 2025 – January 2026',
    context: 'ENS 210 Computational Biology',
    bullets: [
      'Diagnostic tool trained on 3,000+ sequences; evaluated four ML algorithms, reaching a peak accuracy of 98.8%.',
      'Introduced a novel feature representation based on collagen’s amino-acid structure; minimised overfitting through rigorous cross-validation.',
    ],
    stack: ['Python', 'scikit-learn', 'Biopython'],
    link: 'https://github.com/EmirC356/ENS210_Project',
  },
  {
    title: 'E-Commerce Platform',
    role: 'Full-Stack Developer (team of 5)',
    period: 'Fall 2025',
    context: 'CS308 Software Engineering',
    bullets: [
      'Django REST Framework backend, React/Vite frontend, PostgreSQL, JWT auth: product catalogue, cart, checkout, orders, reviews and wishlist.',
      'Agile collaboration via Git and Jira.',
    ],
    stack: ['Django REST Framework', 'React', 'Vite', 'PostgreSQL', 'JWT', 'Git', 'Jira'],
  },
  {
    title: 'Fitness & Accountability App',
    role: 'Developer',
    period: 'Spring 2026 – present',
    status: 'in progress',
    bullets: [
      'Calorie- and exercise-tracking app centred on friend accountability, with one-time (ephemeral) photo sharing.',
    ],
    stack: ['TODO(emir): stack'],
  },
  {
    title: 'This website (emirceylan.com)',
    role: 'Developer',
    period: 'Spring 2024 – present',
    bullets: [
      'Originally self-hosted in Docker with persistent storage and a Firebase backend; now an Astro static site on Vercel with a Supabase-backed visitor drawing gallery.',
    ],
    stack: ['Astro', 'Tailwind CSS', 'TypeScript', 'Supabase', 'Docker', 'Vercel'],
    link: 'https://github.com/EmirCeylan356/EmirCeylanWebsite',
  },
];

export const PRIVATE_EDUCATION = {
  school: 'Sabancı University',
  location: 'Istanbul, Türkiye',
  degree: 'B.Sc. in Computer Science and Engineering',
  period: 'September 2023 – expected 2027',
  notes: [
    'Ranked 7,004th nationally in the YKS; 50% merit scholarship.',
    'Relevant coursework: Data Structures, Algorithms, Bioinformatics, Computational Biology, Machine Learning, Discrete Mathematics.',
    'Top 10% in Data Structures (CS204); strong grades in Algorithms (CS300), Data Science (DSA 210), Computational Biology (ENS 210).',
  ],
};

export const PRIVATE_LEADERSHIP = [
  'Board Member, Deep Technologies Club — BioTech division (2025 – present)',
  'President, Sabancı Archery Club (2024 – 2025)',
];

export const PRIVATE_CERTIFICATIONS = [
  'UC San Diego Bioinformatics Specialization (Coursera)',
  'Stanford Machine Learning (Andrew Ng)',
];

/** One-line title under the name on the CV / recruiter page. */
export const CV_TITLE = 'Computer Science student — machine learning for healthcare';

/** Two-line intro for the recruiter page: who + what he is looking for. */
export const PRIVATE_INTRO = {
  who: 'Computer Science student at Sabancı University (class of 2027) working on machine learning for healthcare: calibrated clinical risk models, explainable AI and bioinformatics, with full-stack experience on the side.',
  lookingFor: 'Looking for paid ML / AI / software work, in Istanbul or remote, that I can hold alongside senior year (2026–27).',
};

/** Static PDF generated by scripts/build-cv-pdf.mjs. Committed to the repo. */
export const CV_PDF_PATH = '/cv-4b8b954c2493/Emir_Ceylan_CV.pdf';

export const CV_SUMMARY =
  'Computer Science student with hands-on experience across machine learning, full-stack software development and data science: from developing and validating models on real-world clinical datasets to building and deploying web apps with React, Docker and Firebase. Seeking a software, ML or data role in industry.';

/** Words that must never appear in a public page's HTML. Used by scripts/privacy-check.mjs. */
export const PRIVATE_TERMS = [
  'amsterdam', 'umc', 'mimic', 'elsa', 'lawathon', 'osteogenesis', 'imperfecta', 'göktaş', 'goktas', 'hosseinjany',
  'taştan', 'tastan', 'ens 210', 'ens210', 'cs308', 'cs 308', 'dsa 210', 'dsa210', 'cs204', 'cs300', 'lace', 'hospital score',
  'deepmyelin', 'teknofest', 'petase', 'github.com/emirc356/ens',
];

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

export const contactMailto = (subject: string, body?: string) =>
  `mailto:${SITE.email}?subject=${encodeURIComponent(`${subject} — Emir Ceylan`)}` +
  (body ? `&body=${encodeURIComponent(body)}` : '');

// ══════════════════════════════════════════════════════════════════════════
//  PUBLIC
// ══════════════════════════════════════════════════════════════════════════

/** Aggregate count shown on the home page ("07+ roles & research projects"). */
export const roleCount = 7; // = PRIVATE_EXPERIENCE.length + hackathon win + OI tool; see below

export const PUBLIC_DOMAINS = ['Clinical ML', 'Explainable AI', 'Bioinformatics', 'Full-stack', 'LLM / RAG'] as const;

export interface Capability {
  label: string;
  metric: string;
  unit: string;
  description: string;
  stack: string;
}

/** Anonymised, real numbers. Institution / dataset / project names omitted on purpose. */
export const PUBLIC_CAPABILITIES: Capability[] = [
  {
    label: 'Clinical risk model',
    metric: '0.898',
    unit: 'AUROC',
    description:
      'Calibrated 30-day post-discharge mortality model for patients over 70, trained on 172k hospital admissions. Beat the standard clinical scores by +0.15 and +0.07 AUROC under grouped cross-validation.',
    stack: 'XGBoost · GroupKFold · SHAP · TRIPOD+AI',
  },
  {
    label: 'EHR feature pipeline',
    metric: '77',
    unit: 'clinical features',
    description:
      'Engineered from a 28 GB raw electronic-health-record release. Every feature has a clinical justification, and the whole pipeline runs on a laptop.',
    stack: 'DuckDB · polars · pandas',
  },
  {
    label: 'Genetic variant classifier',
    metric: '98.8',
    unit: '% peak accuracy',
    description:
      'Diagnosis support for a rare inherited bone disorder from 3,000+ sequences. Four algorithms compared; a novel feature representation based on collagen amino-acid structure did the heavy lifting.',
    stack: 'scikit-learn · Biopython · cross-validation',
  },
  {
    label: 'Legal-tech hackathon',
    metric: '2nd',
    unit: 'place · ₺20k seed',
    description:
      'B2B product that scores litigation outcomes and cites relevant precedent for uploaded case documents. Built in a weekend with a team of five.',
    stack: 'Python · NLP · product pitch',
  },
];

export interface SkillGroup { title: string; items: string[]; note?: string }

export const PUBLIC_SKILLS: { primary: SkillGroup[]; secondary: SkillGroup[] } = {
  primary: [
    {
      title: 'ML & data',
      items: ['XGBoost', 'scikit-learn', 'SHAP', 'pandas', 'polars', 'NumPy', 'DuckDB', 'SQL', 'Matplotlib', 'Biopython', 'Jupyter'],
    },
    {
      title: 'Languages',
      items: ['Python', 'C++', 'JavaScript', 'SQL'],
    },
    {
      title: 'Web & infra',
      items: ['React', 'Vite', 'Django REST Framework', 'PostgreSQL', 'Docker', 'Firebase / Supabase', 'Astro', 'Git / GitHub', 'Jira', 'Ubuntu / Linux'],
    },
    {
      title: 'Concepts',
      items: ['Machine learning', 'Deep learning', 'Explainable AI', 'Model calibration', 'Full-stack web', 'REST APIs', 'Statistics', 'Data visualisation'],
    },
    {
      title: 'Learning now',
      note: 'Deliberately moving from classical ML into LLM engineering. Building a RAG project to prove it.',
      items: ['LLM systems', 'Retrieval-augmented generation', 'Agents'],
    },
  ],
  secondary: [
    { title: 'Creative', items: ['Oil painting', 'Watercolour', 'Drawing', 'Digital illustration', 'Photoshop', 'Premiere Pro'] },
    { title: 'Spoken', items: ['English (C1, fluent)', 'Turkish (native)'] },
  ],
};

/** Credentials that are fine to show publicly (no course codes tied to projects). */
export const PUBLIC_CREDENTIALS = [
  'UC San Diego Bioinformatics Specialization (Coursera)',
  'Stanford Machine Learning (Andrew Ng)',
  'Top 10% in Data Structures; strong grades in Algorithms, Data Science, Computational Biology',
  '50% merit scholarship (ranked 7,004th nationally in the YKS)',
];

/** /now page facts. Update `NOW_UPDATED` whenever these change. */
export const NOW_UPDATED = '2026-08-25';
export const NOW = {
  location: 'Istanbul',
  status: [
    'Senior year (2026–27) at Sabancı University. A planned Spring exchange was cancelled, so I am in Istanbul through 2027.',
    'Actively looking for paid ML / AI / software work, Istanbul or remote, that I can hold alongside senior year.',
    'Moving on purpose from classical ML into AI and LLM engineering: RAG, agents, LLM systems. Building a RAG project to prove it.',
    'Two undergraduate research projects running: explainable deep learning for healthcare decision support, and ML for biomedical alloys.',
    'Manuscript in preparation from a summer clinical-ML internship abroad.',
  ],
  offScreen: ['Painting', 'Archery', 'Jiu-jitsu', 'Fitness', 'Chess'],
};

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

export const CV_SUMMARY =
  'Computer Science student with hands-on experience across machine learning, full-stack software development and data science: from developing and validating models on real-world clinical datasets to building and deploying web apps with React, Docker and Firebase. Seeking a software, ML or data role in industry.';

/** Words that must never appear in a public page's HTML. Used by scripts/privacy-check.mjs. */
export const PRIVATE_TERMS = [
  'amsterdam', 'umc', 'mimic', 'elsa', 'lawathon', 'osteogenesis', 'imperfecta', 'göktaş', 'goktas', 'hosseinjany',
  'taştan', 'tastan', 'ens 210', 'ens210', 'cs308', 'cs 308', 'dsa 210', 'dsa210', 'cs204', 'cs300', 'lace', 'hospital score',
  'deepmyelin', 'teknofest', 'petase', 'github.com/emirc356/ens',
];

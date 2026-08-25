// Static OG images for the fixed pages. Blog posts get their own endpoint at
// src/pages/og/blog/[slug].png.ts. Rendered at build time; see src/lib/og.ts.
import type { APIRoute, GetStaticPaths } from 'astro';
import { renderOg, OG_HEADERS, type OgOptions } from '../../lib/og';
import { SITE } from '../../lib/site';

const PAGES: Record<string, OgOptions> = {
  default: { title: 'Machine learning for healthcare.', subtitle: 'Calibrated clinical risk models, explainable AI, bioinformatics. CS student at Sabancı University, class of 2027.', kicker: SITE.name },
  hobbies: { title: 'Off-screen.', kicker: 'Hobbies /', subtitle: 'Oil painting, archery, jiu-jitsu, chess, and 31 countries.' },
  now: { title: 'What I’m doing now.', kicker: 'Now /', subtitle: 'Senior year in Istanbul, looking for ML / AI work, moving into LLM and RAG systems.' },
  uses: { title: 'What I use.', kicker: 'Uses /', subtitle: 'Editor, stack, tooling and hardware.' },
  blog: { title: 'Notes on ML, medicine, and building things.', kicker: 'Blog /', subtitle: 'Written in a plain first-person engineering voice.' },
  '404': { title: 'Route not found.', kicker: '404 /', subtitle: 'The page you asked for does not exist.' },
};

export const getStaticPaths: GetStaticPaths = () => Object.keys(PAGES).map((page) => ({ params: { page } }));

export const GET: APIRoute = async ({ params }) => {
  const opts = PAGES[params.page as string];
  return new Response(await renderOg(opts), { headers: OG_HEADERS });
};

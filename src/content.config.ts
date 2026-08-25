// Astro 5 content layer. One collection: blog posts as MDX under src/content/blog/.
// Files starting with "_" (the template) are ignored by the loader glob.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: ['**/*.mdx', '!**/_*'] }),
  schema: z.object({
    title: z.string().max(120),
    description: z.string().max(200),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    /** Drafts render in `npm run dev` (with a DRAFT badge) and are excluded from production builds. */
    draft: z.boolean().default(false),
    heroAlt: z.string().optional(),
  }),
});

export const collections = { blog };

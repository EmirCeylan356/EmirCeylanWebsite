// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// Unlisted routes (link-based privacy). They must never appear in the sitemap.
// Keep in sync with UNLISTED_PATHS in src/lib/site.ts and public/robots.txt.
const UNLISTED = ['/work-4b8b954c2493/', '/cv-4b8b954c2493/', '/visitor-gallery-admin/', '/gallery-088c0fbff746/', '/admin/'];

// https://astro.build/config
export default defineConfig({
  site: 'https://www.emirceylan.com',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !UNLISTED.some((u) => page.includes(u.replace(/\/$/, ''))) && !page.includes('/og/') && !page.includes('/404'),
      changefreq: 'monthly',
      lastmod: new Date(),
    }),
  ],
  // /visitor-gallery/ (old public URL) is redirected in vercel.json (301 on the
  // edge, no HTML that could leak the new slug).
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
  vite: {
    plugins: [tailwindcss()],
    // Never inline bundled scripts into the HTML: the CSP in vercel.json allows
    // only same-origin script files plus one hashed bootstrap line in Layout.
    build: { assetsInlineLimit: 0 },
  },
});

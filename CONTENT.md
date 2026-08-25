> **No-code option:** everything below can also be done in the browser at `/admin/` (GitHub login). See [docs/CMS.md](docs/CMS.md).

# Content guide

How to write a blog post, update `/now`, and update `/uses`. Everything here is
static: a push to `main` is the deploy.

Privacy rule for every public page (blog, now, uses): no employer, dataset,
project, course-code or professor names, and no links to project repos.
Anonymised capability language is fine ("a 172k-admission clinical dataset",
"the standard clinical scores"). The full list of banned terms is
`PRIVATE_TERMS` in `src/data/profile.ts`.

## Blog

### Files

```
src/content.config.ts               schema (title, description, pubDate, updatedDate?, tags, draft, heroAlt?)
src/content/blog/_TEMPLATE.mdx      copy this; "_" files are ignored by the loader
src/content/blog/<slug>.mdx         one file per post; the file name is the URL
src/components/blog/posts.ts        draft filter, sorting, dates, reading time
src/layouts/BlogPost.astro          post layout and prose styles
src/pages/blog/index.astro          /blog/
src/pages/blog/[...slug].astro      /blog/<slug>/
src/pages/blog/tag/[tag].astro      /blog/tag/<tag>/
src/pages/rss.xml.ts                /rss.xml
src/pages/og/blog/[slug].png.ts     /og/blog/<slug>.png
```

### Writing a post

1. Copy `src/content/blog/_TEMPLATE.mdx` to `src/content/blog/<slug>.mdx`.
   Use a short kebab-case slug; it becomes `/blog/<slug>/` and cannot change
   later without breaking links.
2. Fill in the frontmatter:

   | field         | required | notes                                                            |
   | ------------- | -------- | ---------------------------------------------------------------- |
   | `title`       | yes      | sentence case, under 80 characters                               |
   | `description` | yes      | 1-2 sentences, max 200 chars; used in the index, meta, OG, RSS   |
   | `pubDate`     | yes      | `YYYY-MM-DD`; posts sort newest first                            |
   | `updatedDate` | no       | shown as "updated" and used as `dateModified`                    |
   | `tags`        | no       | lowercase strings; each gets a `/blog/tag/<tag>/` page           |
   | `draft`       | no       | default `false`; see workflow below                              |
   | `heroAlt`     | no       | reserved for a future hero image                                 |

3. Write Markdown below the frontmatter. Start headings at `##`. Code fences
   are highlighted by Shiki (default theme `github-dark`, restyled to the site
   palette in `BlogPost.astro`). Tables, blockquotes, lists and inline code are
   styled. MDX comments look like `{/* ... */}`.
4. Reading time is computed from the body at 200 words per minute.

### Draft workflow

- `draft: true` posts are **excluded from production builds** everywhere:
  index, post page, tag pages, RSS, OG images.
- `npm run dev` shows drafts with a red DRAFT badge so you can preview them.
- To preview a production build with drafts included:
  `SHOW_DRAFTS=1 npx astro build --outDir .tmp-drafts && npx astro preview --outDir .tmp-drafts`
- Set `draft: false` (or delete the line) and push to `main`. The next deploy
  publishes the post, generates its OG card and adds it to the feed.

### OG images and RSS

- Each published post gets `/og/blog/<slug>.png`, rendered at build time by
  `src/lib/og.ts` (satori + resvg) from the title, description and date. No
  image files to manage.
- `/rss.xml` lists published posts with title, description, date, link and
  tags. Feed readers pick it up from the `<link rel="alternate">` in `<head>`.

### Empty state

When there are zero published posts, `/blog/` shows a panel saying the first
posts are being written, linking to `/now/` and the feed. It disappears on its
own once a post is published.

## /now

Source: `NOW` and `NOW_UPDATED` in `src/data/profile.ts`.

1. Edit the strings in `NOW.status` (order matters: `[where, work, learning, ...research]`),
   `NOW.location`, and `NOW.offScreen`.
2. Bump `NOW_UPDATED` to today's date (`YYYY-MM-DD`). It renders as the
   "LAST UPDATED" line and in the meta description, so a stale date is visible.
3. Push. The page is `src/pages/now.astro`; it has no facts of its own.

## /uses

Source: the `groups` array at the top of `src/pages/uses.astro`.

- Add an item as `{ name: 'Tool', note: 'optional one-line reason' }` in the
  right group. Only list things you actually use.
- Hardware, terminal, shell and editor theme are `TODO(emir)` comments in the
  file. Fill them in when you want them public; there is no placeholder shown.
- Update the "Last checked" date in the footnote when you edit the list.

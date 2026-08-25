// /rss.xml — published posts only (getPosts applies the draft rule).
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../lib/site';
import { getPosts } from '../components/blog/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: `${SITE.name} — blog`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
    })),
    customData: '<language>en</language>',
  });
}

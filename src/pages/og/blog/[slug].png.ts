// Per-post OG image at /og/blog/<slug>.png. Only visible posts get one
// (getPosts applies the draft rule), so drafts never leak a card into prod.
import type { APIRoute } from 'astro';
import { renderOg, OG_HEADERS } from '../../../lib/og';
import { getPosts, formatDate, readingTime, type Post } from '../../../components/blog/posts';

export async function getStaticPaths() {
  const posts = await getPosts();
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export const GET: APIRoute<{ post: Post }> = async ({ props }) => {
  const { post } = props;
  const png = await renderOg({
    kicker: 'Blog /',
    title: post.data.title,
    subtitle: post.data.description,
    meta: `${formatDate(post.data.pubDate)} · ${readingTime(post.body).minutes} MIN READ`.toUpperCase(),
  });
  // .slice().buffer yields a plain ArrayBuffer, which satisfies BodyInit under TS 5.9's stricter Uint8Array typing.
  return new Response(png.slice().buffer, { headers: OG_HEADERS });
};

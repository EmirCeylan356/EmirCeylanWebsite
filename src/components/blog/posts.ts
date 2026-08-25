// Shared blog helpers: draft filtering, sorting, dates, reading time.
// Every blog surface (index, post, tag pages, RSS, OG endpoint) goes through
// `getPosts()` so the draft rule is applied in exactly one place.
import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** Drafts are visible in `astro dev` and when SHOW_DRAFTS=1 is set for a build. Never on a plain production build. */
export const SHOW_DRAFTS = import.meta.env.DEV || process.env.SHOW_DRAFTS === '1';

/** Published posts (plus drafts when SHOW_DRAFTS), newest first. */
export async function getPosts(): Promise<Post[]> {
  const all = await getCollection('blog', ({ data }) => SHOW_DRAFTS || !data.draft);
  return all.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/** Unique tags across the visible posts, alphabetical. */
export async function getTags(): Promise<string[]> {
  const posts = await getPosts();
  return [...new Set(posts.flatMap((p) => p.data.tags))].sort((a, b) => a.localeCompare(b));
}

export const tagSlug = (tag: string) => tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const fmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
/** "25 Aug 2026" */
export const formatDate = (d: Date) => fmt.format(d);
/** "2026-08-25" for <time datetime> and mono labels. */
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Reading time from the raw MDX body: strip frontmatter, code fences, JSX tags
 * and markdown syntax, count words, divide by 200 wpm. Minimum 1 minute.
 */
export function readingTime(body: string | undefined): { minutes: number; words: number } {
  const text = (body ?? '')
    .replace(/^---[\s\S]*?---/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^(import|export)\s.*$/gm, ' ')
    .replace(/[#>*_`~\[\]()|-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return { minutes: Math.max(1, Math.round(words / 200)), words };
}

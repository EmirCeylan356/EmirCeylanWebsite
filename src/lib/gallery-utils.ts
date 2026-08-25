/**
 * Shared, dependency-free helpers for the visitor gallery + admin pages.
 * Everything that touches user-supplied strings lives here so both pages
 * apply exactly the same rules.
 */

export const NAME_MAX = 60;
export const TITLE_MAX = 80;
/** Hard cap on the JPEG data-URL length (characters). Mirrors the RLS CHECK in docs/SUPABASE.md. */
export const IMAGE_MAX_CHARS = 400_000;

/** Only base64 JPEG/PNG data-URLs may ever reach an <img src>. Anything else is dropped. */
const SAFE_IMAGE_RE = /^data:image\/(?:jpeg|png);base64,[A-Za-z0-9+/]+=*$/;

export function isSafeImageSrc(src: unknown): src is string {
  return typeof src === 'string' && src.length <= IMAGE_MAX_CHARS * 2 && SAFE_IMAGE_RE.test(src);
}

/** HTML-escape for the rare places where a string is placed in markup. Prefer textContent. */
export function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Trim, collapse whitespace, and clamp to `max` characters. */
export function cleanText(value: unknown, max: number): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function formatDate(iso: string | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, opts ?? { year: 'numeric', month: 'short', day: '2-digit' });
}

/** Tiny DOM builder: el('p', { class: 'x', text: 'hello' }, child, child) */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | undefined> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined) continue;
    if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) node.append(c);
  return node;
}

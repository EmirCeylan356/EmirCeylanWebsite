/**
 * Open Graph image generator (1200×630) — satori → resvg → PNG.
 *
 * Built at build time by the `src/pages/og/**.png.ts` endpoints, so every page
 * gets a real, on-brand social card instead of a screenshot. Matches the site
 * identity: near-black ground, crimson accent, mono labels, big grotesk title.
 *
 * Usage from an endpoint:
 *   import { renderOg } from '../../lib/og';
 *   export const GET = async () => new Response(await renderOg({ title: '…' }), { headers: { 'Content-Type': 'image/png' } });
 */
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { SITE } from './site';

const require = createRequire(import.meta.url);

export interface OgOptions {
  /** Main line, up to ~60 chars. */
  title: string;
  /** Small mono label above the title, e.g. "BLOG /" or "NOW /". */
  kicker?: string;
  /** One sentence under the title. */
  subtitle?: string;
  /** Bottom-right meta, e.g. a date or reading time. */
  meta?: string;
}

let fontCache: { name: string; data: Buffer; weight: 400 | 500 | 700; style: 'normal' }[] | null = null;

async function loadFonts() {
  if (fontCache) return fontCache;
  const f = (pkg: string, file: string) => readFile(require.resolve(`${pkg}/files/${file}`));
  const [sg700, sg700ext, sg500, jb400, jb700] = await Promise.all([
    f('@fontsource/space-grotesk', 'space-grotesk-latin-700-normal.woff'),
    f('@fontsource/space-grotesk', 'space-grotesk-latin-ext-700-normal.woff'),
    f('@fontsource/space-grotesk', 'space-grotesk-latin-500-normal.woff'),
    f('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff'),
    f('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-700-normal.woff'),
  ]);
  fontCache = [
    { name: 'Space Grotesk', data: sg700, weight: 700, style: 'normal' },
    { name: 'Space Grotesk', data: sg700ext, weight: 700, style: 'normal' },
    { name: 'Space Grotesk', data: sg500, weight: 500, style: 'normal' },
    { name: 'JetBrains Mono', data: jb400, weight: 400, style: 'normal' },
    { name: 'JetBrains Mono', data: jb700, weight: 700, style: 'normal' },
  ];
  return fontCache;
}

const ACCENT = '#C41E3A';
const BG = '#0a0a0a';
const SURFACE = '#131316';
const BORDER = '#2A2A30';
const MUTED = '#AAAAAA';

/** Build the satori element tree without JSX (keeps this file plain TS). */
function h(type: string, props: Record<string, unknown>, ...children: unknown[]) {
  const kids = children.filter((c) => c !== null && c !== undefined);
  return { type, props: { ...props, children: kids.length === 0 ? undefined : kids.length === 1 ? kids[0] : kids } };
}

export async function renderOg(opts: OgOptions): Promise<Uint8Array> {
  const fonts = await loadFonts();
  const title = opts.title.length > 90 ? opts.title.slice(0, 87) + '…' : opts.title;
  const titleSize = title.length > 48 ? 56 : title.length > 28 ? 72 : 96;

  // 64px grid, drawn as absolutely positioned hairlines (satori has no background-image gradients).
  const gridLines: unknown[] = [];
  for (let x = 64; x < 1200; x += 64) gridLines.push(h('div', { style: { position: 'absolute', left: x, top: 0, width: 1, height: 630, backgroundColor: 'rgba(138,138,147,0.10)' } }));
  for (let y = 64; y < 630; y += 64) gridLines.push(h('div', { style: { position: 'absolute', left: 0, top: y, width: 1200, height: 1, backgroundColor: 'rgba(138,138,147,0.10)' } }));

  const tree = h(
    'div',
    { style: { width: 1200, height: 630, display: 'flex', flexDirection: 'column', backgroundColor: BG, color: '#fff', fontFamily: 'Space Grotesk', position: 'relative', overflow: 'hidden' } },
    ...gridLines,
    // crimson glow, bottom-right
    h('div', { style: { position: 'absolute', right: -180, bottom: -220, width: 620, height: 620, borderRadius: 620, background: 'radial-gradient(circle, rgba(196,30,58,0.35) 0%, rgba(196,30,58,0) 62%)' } }),
    // top bar
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '36px 64px 0', fontFamily: 'JetBrains Mono', fontSize: 22, letterSpacing: 3, color: MUTED } },
      h('div', { style: { display: 'flex', alignItems: 'center' } },
        h('span', { style: { color: ACCENT, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 40, letterSpacing: -2, marginRight: 18 } }, 'EC_'),
        h('span', {}, `${SITE.tagline} — ISTANBUL`),
      ),
      h('span', {}, 'emirceylan.com'),
    ),
    // main block
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', flex: 1, padding: '0 64px 56px' } },
      opts.kicker
        ? h('div', { style: { display: 'flex', alignItems: 'center', fontFamily: 'JetBrains Mono', fontSize: 22, letterSpacing: 4, color: ACCENT, marginBottom: 18 } },
            h('div', { style: { width: 10, height: 10, borderRadius: 10, backgroundColor: ACCENT, marginRight: 14 } }),
            h('span', {}, opts.kicker.toUpperCase()))
        : null,
      h('div', { style: { display: 'flex', fontSize: titleSize, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2, maxWidth: 1000 } }, title),
      opts.subtitle
        ? h('div', { style: { display: 'flex', fontSize: 28, fontWeight: 500, color: MUTED, marginTop: 22, maxWidth: 900, lineHeight: 1.35 } }, opts.subtitle)
        : null,
    ),
    // bottom rule + meta
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 64px 36px', paddingTop: 22, borderTop: `1px solid ${BORDER}`, fontFamily: 'JetBrains Mono', fontSize: 20, letterSpacing: 3, color: MUTED } },
      h('span', {}, `${SITE.name.toUpperCase()} · ${SITE.university.toUpperCase()} ’${String(SITE.gradYear).slice(2)}`),
      h('span', { style: { color: opts.meta ? '#fff' : MUTED } }, opts.meta ?? 'github.com/EmirC356'),
    ),
    // corner frame accents
    h('div', { style: { position: 'absolute', left: 40, top: 110, width: 28, height: 28, borderLeft: `2px solid ${ACCENT}`, borderTop: `2px solid ${ACCENT}` } }),
    h('div', { style: { position: 'absolute', right: 40, bottom: 110, width: 28, height: 28, borderRight: `2px solid ${ACCENT}`, borderBottom: `2px solid ${ACCENT}` } }),
  );

  const svg = await satori(tree as never, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 }, background: SURFACE }).render().asPng();
  return png;
}

export const OG_HEADERS = { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' };

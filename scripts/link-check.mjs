// Internal link check over the built site: every <a href>, <link href>,
// <img src>, <source srcset>, <script src> pointing at this origin must
// resolve to a file in dist/. External links are listed (and optionally
// HEAD-checked with --external) but never fail the build.
//
//   node scripts/link-check.mjs [distDir] [--external]
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

const dist = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'dist';
const checkExternal = process.argv.includes('--external');

function walk(d, acc = []) {
  for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p, acc) : f.endsWith('.html') && acc.push(p); }
  return acc;
}
const resolves = (url) => {
  const clean = url.split('#')[0].split('?')[0];
  if (!clean) return true;
  const p = join(dist, clean);
  return existsSync(p) || existsSync(join(p, 'index.html')) || existsSync(p + '.html') || existsSync(p.replace(/\/$/, '') + '.html');
};

const broken = [], external = new Set();
for (const file of walk(dist)) {
  const html = readFileSync(file, 'utf8');
  const rel = relative(dist, file).replace(/\\/g, '/');
  const urls = [];
  for (const m of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) urls.push(m[1]);
  for (const m of html.matchAll(/srcset=["']([^"']+)["']/g)) for (const part of m[1].split(',')) urls.push(part.trim().split(/\s+/)[0]);
  for (const u of urls) {
    if (u.startsWith('mailto:') || u.startsWith('tel:') || u.startsWith('data:') || u.startsWith('javascript:')) continue;
    if (/^https?:\/\//.test(u)) { if (!u.startsWith('https://www.emirceylan.com')) external.add(u); else if (!resolves(u.replace('https://www.emirceylan.com', ''))) broken.push({ rel, u }); continue; }
    if (u.startsWith('#')) { const id = u.slice(1); if (id && !new RegExp(`id=["']${id}["']`).test(html)) broken.push({ rel, u: u + ' (missing id)' }); continue; }
    const target = u.startsWith('/') ? u : '/' + join(dirname(rel), u).replace(/\\/g, '/');
    if (!resolves(target)) broken.push({ rel, u });
  }
}

if (broken.length) { for (const b of broken) console.error(`✖ ${b.rel} → ${b.u}`); console.error(`\n${broken.length} broken internal link(s).`); }
else console.log('Internal links: 0 broken.');
console.log(`External links: ${external.size} unique.`);
if (checkExternal) {
  const dead = [];
  for (const u of external) {
    try { const r = await fetch(u, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(10000) }); if (r.status >= 400 && r.status !== 405 && r.status !== 403 && r.status !== 429) dead.push(`${r.status} ${u}`); }
    catch (e) { dead.push(`ERR ${u} (${e.message})`); }
  }
  if (dead.length) console.warn('External links to review:\n  ' + dead.join('\n  ')); else console.log('External links: all reachable.');
}
process.exit(broken.length ? 1 : 0);

// Privacy gate: the PUBLIC build output must not contain employer, dataset,
// project, course-code or professor names, nor the phone number. Unlisted
// routes are allowed to contain them and are skipped.
//
//   node scripts/privacy-check.mjs [distDir]      (exit 1 on any hit)
//
// Term list lives next to the data it protects: PRIVATE_TERMS in
// src/data/profile.ts (read here as text so this stays dependency-free).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = process.argv[2] || 'dist';
const UNLISTED = ['work-4b8b954c2493', 'cv-4b8b954c2493', 'visitor-gallery-admin', 'gallery-088c0fbff746'];

const profile = readFileSync('src/data/profile.ts', 'utf8');
const m = profile.match(/PRIVATE_TERMS\s*=\s*\[([\s\S]*?)\];/);
if (!m) { console.error('PRIVATE_TERMS not found in src/data/profile.ts'); process.exit(2); }
const terms = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1].toLowerCase());
// Phone-number shape (never allowed anywhere, including unlisted pages).
const PHONE = /(\+90[\s\d]{9,}|\b0?5\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}\b)/;

function walk(d, acc = []) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(html|xml|txt|json|js|css)$/.test(f)) acc.push(p);
  }
  return acc;
}

let hits = 0;
for (const file of walk(dist)) {
  const rel = relative(dist, file).replace(/\\/g, '/');
  const text = readFileSync(file, 'utf8');
  const lower = text.toLowerCase();
  const unlisted = UNLISTED.some((u) => rel.includes(u));
  if (PHONE.test(text)) { console.error(`✖ phone-number pattern in ${rel}`); hits++; }
  if (unlisted) continue;
  for (const t of terms) {
    // Whole-word match so "lace" never trips on "replace" / "placeholder".
    const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`, 'iu');
    const i = lower.search(re);
    if (i > -1) {
      console.error(`✖ "${t}" in ${rel}: …${text.slice(Math.max(0, i - 40), i + 60).replace(/\s+/g, ' ')}…`);
      hits++;
    }
  }
  // Public pages must never link to the unlisted routes (except the hobbies → gallery link, a deliberate decision).
  for (const u of UNLISTED) {
    if (u === 'gallery-088c0fbff746' && rel === 'hobbies/index.html') continue;
    if (lower.includes(u) && !rel.startsWith('sitemap') && rel !== 'robots.txt') { console.error(`✖ unlisted slug "${u}" referenced from public file ${rel}`); hits++; }
  }
}
// Sitemap must not list unlisted routes.
for (const file of walk(dist).filter((f) => /sitemap.*\.xml$/.test(f))) {
  const text = readFileSync(file, 'utf8');
  for (const u of UNLISTED) if (text.includes(u)) { console.error(`✖ unlisted route in ${relative(dist, file)}: ${u}`); hits++; }
}
if (hits) { console.error(`\nPrivacy check FAILED with ${hits} hit(s).`); process.exit(1); }
console.log(`Privacy check passed (${terms.length} terms, ${UNLISTED.length} unlisted routes).`);

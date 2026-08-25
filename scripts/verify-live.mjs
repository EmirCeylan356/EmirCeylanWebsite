// Post-deploy smoke test against production:
//   node scripts/verify-live.mjs [https://www.emirceylan.com]
// Checks status codes, redirect, noindex on unlisted routes, sitemap contents,
// OG tags, security headers. Exit 1 on any failure.
const base = (process.argv[2] || 'https://www.emirceylan.com').replace(/\/$/, '');
const UNLISTED = ['/work-4b8b954c2493/', '/cv-4b8b954c2493/', '/gallery-088c0fbff746/', '/visitor-gallery-admin/'];
let fails = 0;
const ok = (cond, msg) => { console.log(`${cond ? '✓' : '✖'} ${msg}`); if (!cond) fails++; };
const get = (p, init) => fetch(base + p, { redirect: 'manual', cache: 'no-store', ...init });

// Public routes
for (const p of ['/', '/hobbies/', '/blog/', '/now/', '/uses/', '/rss.xml', '/sitemap-index.xml', '/sitemap-0.xml', '/robots.txt', '/og/default.png', '/site.webmanifest', '/fonts/space-grotesk-latin-wght-normal.woff2']) {
  const r = await get(p); ok(r.status === 200, `${p} → ${r.status}`);
}
// 404
{ const r = await get('/definitely-not-a-route/'); const html = await r.text(); ok(r.status === 404 && html.includes('route not found'), `/definitely-not-a-route/ → ${r.status}, custom 404 page`); }
// Redirect
{ const r = await get('/visitor-gallery/'); ok([301, 308].includes(r.status) && /hobbies/.test(r.headers.get('location') || ''), `/visitor-gallery/ → ${r.status} ${r.headers.get('location')}`); }
{ const r = await get('/visitor-gallery'); ok([301, 308].includes(r.status), `/visitor-gallery → ${r.status} ${r.headers.get('location')}`); }
// Unlisted: reachable, noindex, not in sitemap
const sitemap = await (await get('/sitemap-0.xml')).text();
for (const p of UNLISTED) {
  const r = await get(p); const html = await r.text();
  ok(r.status === 200, `${p} reachable (${r.status})`);
  ok(/<meta name="robots" content="noindex, nofollow">/.test(html), `${p} has noindex`);
  ok(!sitemap.includes(p.replace(/\/$/, '')), `${p} absent from sitemap`);
}
ok(!/\+90/.test(await (await get('/cv-4b8b954c2493/')).text()), 'CV page has no phone number');
// Home HTML: title, description, OG, canonical, JSON-LD, no GSAP/Google Fonts
{
  const html = await (await get('/')).text();
  ok(/<title>Emir Ceylan — ML \/ Medical AI<\/title>/.test(html), 'home <title> is the new brand line');
  ok(/<meta name="description" content="[^"]{50,}"/.test(html), 'home meta description present');
  ok(/property="og:image" content="https:\/\/www\.emirceylan\.com\/og\/default\.png"/.test(html), 'og:image is absolute');
  ok(/rel="canonical" href="https:\/\/www\.emirceylan\.com\/"/.test(html), 'canonical present');
  ok(/application\/ld\+json/.test(html) && /"@type":"Person"/.test(html), 'Person JSON-LD present');
  ok(!/cdnjs|fonts\.googleapis/.test(html), 'no CDN scripts or Google Fonts');
  ok(!/amsterdam|mimic|lawathon|osteogenesis/i.test(html), 'no private terms on home');
  const og = await get('/og/default.png'); ok(og.headers.get('content-type') === 'image/png', 'og:image serves image/png');
}
// Headers
{
  const h = (await get('/')).headers;
  for (const k of ['content-security-policy', 'x-content-type-options', 'referrer-policy', 'permissions-policy', 'strict-transport-security', 'x-frame-options']) ok(!!h.get(k), `header ${k}: ${(h.get(k) || 'MISSING').slice(0, 60)}`);
  const f = (await get('/fonts/space-grotesk-latin-wght-normal.woff2')).headers; ok(/immutable/.test(f.get('cache-control') || ''), `font cache-control: ${f.get('cache-control')}`);
}
// robots
{ const t = await (await get('/robots.txt')).text(); ok(UNLISTED.every(u => t.includes('Disallow: ' + u)), 'robots.txt disallows all unlisted routes'); ok(/Sitemap: https:\/\/www\.emirceylan\.com\/sitemap-index\.xml/.test(t), 'robots.txt points at sitemap'); }
// RSS
{ const t = await (await get('/rss.xml')).text(); ok(/<rss/.test(t) && !/<item>/.test(t), 'rss.xml valid and contains no draft items'); }
console.log(fails ? `\n${fails} check(s) FAILED` : '\nAll live checks passed.');
process.exit(fails ? 1 : 0);

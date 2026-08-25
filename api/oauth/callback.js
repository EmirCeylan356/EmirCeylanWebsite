// Vercel serverless function: GitHub OAuth for Decap CMS (step 2 of 2).
// Exchanges the `code` for a token and hands it to the CMS window via the
// postMessage handshake Decap expects ("authorizing:github" → token message).
//
// The handshake script is /admin/oauth-callback.js (an external file, because
// the site's CSP forbids inline scripts).
// Robustness: if the popup lost its link to the editor window (window.opener
// is null — happens when a browser opens the auth flow in a tab, or when a
// Cross-Origin-Opener-Policy severs it), the token is also stored the way
// Decap's own auth store does (localStorage "decap-cms-user", same origin), so
// the "Continue to editor" link logs the user in anyway.
export default async function handler(req, res) {
  const { code, state } = req.query || {};
  const cookieState = (req.headers.cookie || '').split(';').map((c) => c.trim()).find((c) => c.startsWith('oauth_state='))?.slice('oauth_state='.length);
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Set-Cookie', 'oauth_state=; Path=/api/oauth; HttpOnly; Secure; SameSite=Lax; Max-Age=0');

  const page = (status, payload) => {
    const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
    const ok = status === 'success';
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Admin sign-in</title>
<style>body{margin:0;background:#0a0a0a;color:#eee;font:15px/1.6 system-ui,sans-serif}main{max-width:32rem;margin:12vh auto;padding:2rem}b{color:#F0405E}a{color:#fff}code{color:#aaa}
.btn{display:inline-block;margin-top:1rem;padding:.8rem 1.2rem;background:#C41E3A;color:#fff;text-decoration:none;font-weight:700}</style></head><body><main>
<p><b>EC_</b> ${ok ? 'Signed in with GitHub.' : 'Sign-in failed: ' + String(payload.error || '')}</p>
<p id="hint">${ok ? 'Handing the session to the editor…' : ''}</p>
${ok ? '<a class="btn" id="go" href="/admin/">Continue to editor →</a>' : '<a class="btn" href="/admin/">Back to editor</a>'}
<script src="/admin/oauth-callback.js" data-ok="${ok ? 1 : 0}" data-message="${String(message).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" data-token="${ok ? payload.token : ''}"></script></main></body></html>`;
  };

  const send = (status, payload) => res.status(200).send(page(status, payload));

  if (!clientId || !clientSecret) return send('error', { error: 'OAuth env vars not set on Vercel' });
  if (!code) return send('error', { error: 'Missing code' });
  if (!state || state !== cookieState) return send('error', { error: 'State mismatch — go back to /admin/ and try again' });

  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, state }),
    });
    const data = await r.json();
    if (!data.access_token) return send('error', { error: data.error_description || data.error || 'No token returned' });
    return send('success', { token: data.access_token, provider: 'github' });
  } catch (e) {
    return send('error', { error: e.message });
  }
}

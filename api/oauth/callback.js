// Vercel serverless function: GitHub OAuth for Decap CMS (step 2 of 2).
// Exchanges the `code` for a token and hands it to the CMS window via the
// postMessage handshake Decap expects ("authorizing:github" → token message).
export default async function handler(req, res) {
  const { code, state } = req.query || {};
  const cookieState = (req.headers.cookie || '').split(';').map((c) => c.trim()).find((c) => c.startsWith('oauth_state='))?.slice('oauth_state='.length);
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Set-Cookie', 'oauth_state=; Path=/api/oauth; HttpOnly; Secure; SameSite=Lax; Max-Age=0');

  const respond = (status, payload) => {
    const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
    res.status(200).send(`<!doctype html><html><body><script>
      (function () {
        function receiveMessage(e) {
          window.opener.postMessage(${JSON.stringify(message)}, e.origin);
          window.removeEventListener('message', receiveMessage, false);
        }
        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:github', '*');
      })();
    </script><p style="font:14px system-ui;padding:2rem">${status === 'success' ? 'Signed in. You can close this window.' : 'Sign-in failed: ' + String(payload.error || '')}</p></body></html>`);
  };

  if (!clientId || !clientSecret) return respond('error', { error: 'OAuth env vars not set on Vercel' });
  if (!code) return respond('error', { error: 'Missing code' });
  if (!state || state !== cookieState) return respond('error', { error: 'State mismatch — try again' });

  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, state }),
    });
    const data = await r.json();
    if (!data.access_token) return respond('error', { error: data.error_description || data.error || 'No token returned' });
    return respond('success', { token: data.access_token, provider: 'github' });
  } catch (e) {
    return respond('error', { error: e.message });
  }
}

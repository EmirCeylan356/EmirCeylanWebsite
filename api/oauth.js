// Vercel serverless function: GitHub OAuth for Decap CMS (step 1 of 2).
//   GET /api/oauth            → redirect the user to GitHub's authorize page
//   GET /api/oauth/callback   → handled by ./oauth/callback.js
//
// Needs two Vercel env vars (Project → Settings → Environment Variables):
//   OAUTH_GITHUB_CLIENT_ID, OAUTH_GITHUB_CLIENT_SECRET
// from a GitHub OAuth App whose callback URL is
//   https://www.emirceylan.com/api/oauth/callback/
import crypto from 'node:crypto';

export default function handler(req, res) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('OAUTH_GITHUB_CLIENT_ID is not set on Vercel.');
    return;
  }
  const state = crypto.randomBytes(16).toString('hex');
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('scope', 'repo,user');
  url.searchParams.set('state', state);
  res.setHeader('Set-Cookie', `oauth_state=${state}; Path=/api/oauth; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  res.setHeader('Cache-Control', 'no-store');
  res.redirect(302, url.toString());
}

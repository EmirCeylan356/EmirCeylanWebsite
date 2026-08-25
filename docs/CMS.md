# Editing the site without touching code — the `/admin/` CMS

The site has a git-backed CMS ([Decap CMS](https://decapcms.org)) at
**https://www.emirceylan.com/admin/** (also linked as the tiny "admin" word in the footer).

- You sign in with **your GitHub account**. Only accounts with write access to
  `EmirCeylan356/EmirCeylanWebsite` can save anything, so nobody else can edit even if they
  find the URL.
- Every **Save/Publish is a git commit to `main`**. Vercel rebuilds and the change is live
  in about two minutes. Full history and undo live in `git log`.
- Nothing is stored anywhere except the repo: no database, no third-party content host.

## One-time setup (≈ 3 minutes)

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
   - Application name: `emirceylan.com admin`
   - Homepage URL: `https://www.emirceylan.com`
   - Authorization callback URL: `https://www.emirceylan.com/api/oauth/callback/` (note the trailing slash)
   - Register, then **Generate a new client secret**.
2. Vercel → project → **Settings → Environment Variables** (Production + Preview):
   - `OAUTH_GITHUB_CLIENT_ID` = the Client ID
   - `OAUTH_GITHUB_CLIENT_SECRET` = the secret
3. **Redeploy** (Deployments → ⋯ → Redeploy) so the functions pick up the variables.
4. Open https://www.emirceylan.com/admin/ → "Login with GitHub".

The OAuth handshake is two tiny serverless functions in [`api/oauth.js`](../api/oauth.js) and
[`api/oauth/callback.js`](../api/oauth/callback.js); they never store the token.

## What you can edit

| Section in the CMS | What it changes | File it writes |
| --- | --- | --- |
| **Blog posts** | Create, edit, publish (`Draft` unchecked) or delete posts. Markdown editor with code blocks. | `src/content/blog/<slug>.mdx` |
| **Hobbies · paintings** | Add / remove / reorder paintings, upload the image, set title, medium, year, alt text. | `src/data/artworks.json` + image in `src/assets/paintings/` |
| **Site texts** | Hero lines, marquee, About, Work section (tiles, CTA), Skills, footer/contact copy, the `/now` page (bump *Last updated*). | `src/data/content.json` |

Facts that stay in code on purpose: the private recruiter/CV data (`PRIVATE_*` in
`src/data/profile.ts`) and the `07+` role count. Edit those in the repo and run `npm run cv:pdf`.

## Tips

- **Images**: upload JPG/PNG at ≤ 3000 px on the long side. The build generates AVIF/WebP
  sizes; you never need to resize for the web yourself.
- **Alt text**: describe what is visible in one sentence. It is read by screen readers and
  search engines.
- **Drafts**: a post with *Draft* checked is invisible on the live site but shows in
  `npm run dev` with a DRAFT badge.
- **Now page**: the "Last updated" field is rendered on the page, so bump it when you
  change anything there.
- **Something looks wrong after a save?** `git log` on `main` shows the CMS commit
  (`content: update …`); `git revert <sha>` and push puts it back.

## Editing locally without GitHub

```sh
npm run cms:local     # starts the Decap local proxy on :8081
npm run dev           # in another terminal
```

Open http://localhost:4321/admin/ — with the proxy running the CMS offers a
"Work with local repository" option that writes straight to your working tree (no
commits). Review with `git diff`, commit when happy.

## Security notes

- `/admin/` and `/api/` are `noindex`, disallowed in `robots.txt`, excluded from the
  sitemap, served with `Cache-Control: no-store`.
- The CMS page has its own, slightly looser Content-Security-Policy (`vercel.json`) because
  the editor needs inline styles and calls `api.github.com`; the rest of the site keeps the
  strict policy.
- The OAuth `state` is checked against an HttpOnly cookie to block login CSRF.

# Supabase setup for the visitor gallery

The gallery (`/gallery-088c0fbff746/`) and its admin page (`/visitor-gallery-admin/`)
talk to Supabase straight from the browser with the **public anon key**. That key
is, by design, visible to anyone who opens the page source. It is not a secret and
cannot be made one.

> **Read this first.** Until the Row Level Security policies below exist,
> *anyone who reads the page source can delete every row* in `gallery_submissions`
> (and insert arbitrary junk) using the anon key — the admin page's login is only
> a UI convenience, not a server-side gate. We could not verify the current
> policies from the codebase; assume they are missing until you have run this SQL.

## 1. Run this in the SQL editor (Dashboard → SQL Editor → New query)

```sql
-- ── Lock the table down ─────────────────────────────────────────────────────
alter table public.gallery_submissions enable row level security;

-- Start clean (safe to re-run)
drop policy if exists "gallery: anyone can read"          on public.gallery_submissions;
drop policy if exists "gallery: anyone can submit"        on public.gallery_submissions;
drop policy if exists "gallery: only admins can delete"   on public.gallery_submissions;

-- ── Public read ─────────────────────────────────────────────────────────────
create policy "gallery: anyone can read"
  on public.gallery_submissions
  for select
  to anon, authenticated
  using (true);

-- ── Public insert, but only well-formed rows ────────────────────────────────
--   • name  ≤ 60 chars, title ≤ 80 chars, neither blank
--   • image must be a base64 JPEG data-URL no longer than 400 000 chars
--   • nobody may set id / created_at by hand (defaults do it)
create policy "gallery: anyone can submit"
  on public.gallery_submissions
  for insert
  to anon, authenticated
  with check (
        length(btrim(name))  between 1 and 60
    and length(btrim(title)) between 1 and 80
    and image_data like 'data:image/jpeg;base64,%'
    and length(image_data) <= 400000
  );

-- ── Delete: signed-in Supabase Auth users only ──────────────────────────────
create policy "gallery: only admins can delete"
  on public.gallery_submissions
  for delete
  to authenticated
  using (auth.role() = 'authenticated');

-- No UPDATE policy on purpose: with RLS on and no policy, updates are denied.

-- ── Belt and braces: the same limits as table constraints ───────────────────
-- (RLS only applies to API roles; constraints apply to everyone.)
alter table public.gallery_submissions
  drop constraint if exists gallery_name_len,
  drop constraint if exists gallery_title_len,
  drop constraint if exists gallery_image_shape;
alter table public.gallery_submissions
  add constraint gallery_name_len    check (length(btrim(name))  between 1 and 60),
  add constraint gallery_title_len   check (length(btrim(title)) between 1 and 80),
  add constraint gallery_image_shape check (image_data like 'data:image/jpeg;base64,%' and length(image_data) <= 400000);
```

If the table does not exist yet:

```sql
create table if not exists public.gallery_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  title       text not null,
  image_data  text not null,
  created_at  timestamptz not null default now()
);
```

Then run the policy block above.

## 2. Create your admin user

Dashboard → **Authentication → Users → Add user → Create new user**: enter your
email and a strong password, tick **Auto Confirm User**, save. That is the account
you sign in with on `/visitor-gallery-admin/`.

Also under **Authentication → Providers → Email**, turn **off** "Allow new users
to sign up" so nobody else can create an account and gain delete rights.

## 3. Verify (optional, 30 seconds)

In the SQL editor:

```sql
select policyname, cmd, roles from pg_policies where tablename = 'gallery_submissions';
```

You should see exactly three rows: a `SELECT`, an `INSERT`, and a `DELETE`
(the last one for `{authenticated}` only). Then, logged **out** of the admin page,
open the browser console on the gallery and run a delete through the anon client —
it must return zero rows.

## What the client does on top of this (defence in depth, not the real fix)

- name / title trimmed and clamped to 60 / 80 characters
- blank canvases are rejected before upload
- JPEG re-encoded at decreasing quality until it fits under 400 KB, else refused
- one submission per 30 s per browser tab (sessionStorage)
- honeypot field; if filled, the submission is dropped
- every `image_data` rendered anywhere is checked to be a `data:image/jpeg;base64,`
  or `data:image/png;base64,` URL before it reaches an `<img src>`; anything else is skipped

## Environment

`.env` (never committed) needs:

```
PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<anon public key>
```

Both are public values; the `service_role` key must **never** appear in this repo.

/**
 * Gallery admin client. Gate = Supabase Auth (email + password); the session
 * is persisted by supabase-js in localStorage. DELETE is only offered while a
 * session exists, and only actually succeeds if the RLS policy in
 * docs/SUPABASE.md restricts DELETE to authenticated users.
 */
import { supabase, isConfigured, GALLERY_TABLE, type GallerySubmission } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { NAME_MAX, TITLE_MAX, isSafeImageSrc, cleanText, el } from '../lib/gallery-utils';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

const loginView = $('login-view');
const dashView = $('dashboard-view');
const loginForm = $<HTMLFormElement>('login-form');
const emailInp = $<HTMLInputElement>('email-input');
const pwInp = $<HTMLInputElement>('pw-input');
const loginBtn = $<HTMLButtonElement>('login-btn');
const loginError = $('login-error');
const setupNote = $('admin-setup');
const whoami = $('admin-who');
const countEl = $('admin-count');
const grid = $('admin-grid');
const empty = $('admin-empty');
const errEl = $('admin-error');
const refreshBtn = $<HTMLButtonElement>('refresh-btn');
const signoutBtn = $<HTMLButtonElement>('signout-btn');

let session: Session | null = null;

function showLoginError(msg: string): void {
  loginError.textContent = msg;
  loginError.hidden = false;
}

function setView(authed: boolean): void {
  loginView.hidden = authed;
  dashView.hidden = !authed;
}

function setCount(n: number): void {
  countEl.textContent = `${n} submission${n === 1 ? '' : 's'} total`;
}

async function loadAdmin(): Promise<void> {
  if (!supabase || !session) return;
  errEl.hidden = true;
  countEl.textContent = 'Loading...';
  grid.replaceChildren();
  const res = await supabase.from(GALLERY_TABLE)
    .select('id, name, title, image_data, created_at')
    .order('created_at', { ascending: false });
  if (res.error) {
    errEl.textContent = `Could not load submissions: ${res.error.message}`;
    errEl.hidden = false;
    countEl.textContent = 'Load failed';
    return;
  }
  const items = (res.data || []) as GallerySubmission[];
  setCount(items.length);
  empty.hidden = items.length !== 0;

  for (const it of items) {
    const title = cleanText(it.title, TITLE_MAX) || 'Untitled';
    const name = cleanText(it.name, NAME_MAX) || 'Anonymous';
    const id = String(it.id);
    const safe = isSafeImageSrc(it.image_data);
    const card = el('article', { class: 'admin-card', 'aria-label': `${title} by ${name}` },
      safe
        ? el('img', { src: it.image_data, alt: `${title} by ${name}`, width: '600', height: '390', loading: 'lazy' })
        : el('div', { class: 'admin-badimg font-mono', text: 'IMAGE REJECTED — not a JPEG/PNG data URL' }),
      el('p', { class: 'admin-title', text: title }),
      el('p', { class: 'font-mono text-xs admin-sub', text: `by ${name}` }),
      el('p', { class: 'font-mono text-xs admin-meta', text: new Date(it.created_at).toLocaleString() }),
      el('p', { class: 'font-mono text-xs admin-meta', text: `ID: ${id.slice(0, 8)}…` }),
    );
    const del = el('button', { type: 'button', class: 'del-btn', 'aria-label': `Delete "${title}" by ${name}`, text: 'DELETE' });
    del.addEventListener('click', async () => {
      if (!supabase || !session) return;
      if (!confirm(`Delete "${title}" by ${name} permanently?`)) return;
      del.disabled = true;
      del.textContent = 'DELETING...';
      const delRes = await supabase.from(GALLERY_TABLE).delete().eq('id', id).select('id');
      if (delRes.error || !delRes.data || delRes.data.length === 0) {
        // Zero rows back usually means RLS silently blocked the delete.
        const why = delRes.error?.message || 'no row was removed — check the DELETE policy in docs/SUPABASE.md';
        alert(`Delete failed: ${why}`);
        del.disabled = false;
        del.textContent = 'DELETE';
        return;
      }
      card.remove();
      const remaining = grid.querySelectorAll('.admin-card').length;
      setCount(remaining);
      empty.hidden = remaining !== 0;
    });
    card.append(del);
    grid.append(card);
  }
}

async function applySession(s: Session | null): Promise<void> {
  session = s;
  setView(Boolean(s));
  if (s) {
    whoami.textContent = s.user.email || s.user.id;
    await loadAdmin();
  } else {
    grid.replaceChildren();
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.hidden = true;
  if (!supabase) return showLoginError('Supabase is not configured on this deployment.');
  const email = emailInp.value.trim();
  const password = pwInp.value;
  if (!email || !password) return showLoginError('Enter your email and password.');
  loginBtn.disabled = true;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) return showLoginError(error?.message || 'Sign-in failed.');
    pwInp.value = '';
    await applySession(data.session);
  } catch {
    showLoginError('Could not reach the auth server. Check your connection and try again.');
  } finally {
    loginBtn.disabled = false;
  }
});

signoutBtn.addEventListener('click', async () => {
  if (supabase) await supabase.auth.signOut();
  await applySession(null);
});
refreshBtn.addEventListener('click', () => { void loadAdmin(); });

/* ── Init ─────────────────────────────────────────────────────────────── */
if (!isConfigured || !supabase) {
  setupNote.hidden = false;
  loginBtn.disabled = true;
} else {
  supabase.auth.onAuthStateChange((event, s) => {
    if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
      if ((s?.access_token ?? null) !== (session?.access_token ?? null)) void applySession(s);
    }
  });
  void supabase.auth.getSession().then(({ data }) => applySession(data.session));
}

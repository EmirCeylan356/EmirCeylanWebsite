import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

/** True only when both PUBLIC_ env vars are set to something that is not the template placeholder. */
export const isConfigured: boolean =
  Boolean(supabaseUrl && supabaseAnonKey) && !supabaseUrl.includes('your-project');

/**
 * Browser client built from the PUBLIC anon key. The anon key is, by design,
 * visible to anyone who reads the page source — every security guarantee
 * lives in the Row Level Security policies documented in docs/SUPABASE.md.
 */
export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
  : null;

/** Table used by the visitor gallery and its admin page. */
export const GALLERY_TABLE = 'gallery_submissions';

/** Row shape as selected by the gallery and admin pages. */
export interface GallerySubmission {
  id: string;
  name: string;
  title: string;
  image_data: string;
  created_at: string;
}

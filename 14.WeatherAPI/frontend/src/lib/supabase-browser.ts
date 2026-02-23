// ============================================
// Supabase Client — Browser-side (for React components)
// Uses ONLY the anon key (safe and public)
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.warn('⚠️ Supabase env vars not set — browser client not initialized.');
    supabase = null as unknown as SupabaseClient;
}

export { supabase };

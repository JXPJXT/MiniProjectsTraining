// ============================================
// Supabase Client — Server-side (for API routes)
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseServer: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
    supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
        },
    });
} else {
    console.warn('⚠️ Supabase env vars not set — server client not initialized.');
    supabaseServer = null as unknown as SupabaseClient;
}

export { supabaseServer };

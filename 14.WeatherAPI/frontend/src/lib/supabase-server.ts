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
    // During build or when env vars missing, create a dummy that will fail gracefully at runtime
    console.warn('⚠️ Supabase env vars not set — server client not initialized.');
    supabaseServer = null as unknown as SupabaseClient;
}

export { supabaseServer };

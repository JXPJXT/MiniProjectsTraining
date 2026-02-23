// ============================================
// Supabase Client — Server-side (for API routes)
// Uses service_role key or anon key based on context
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables!');
}

// Server-side client (used in API routes and server components)
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
    },
});

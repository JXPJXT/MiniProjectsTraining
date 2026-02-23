// ============================================
// Supabase Client — Browser-side (for React components)
// Uses ONLY the anon key (safe and public)
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser-side client (singleton)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

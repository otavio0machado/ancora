// ============================================================
// Supabase server client (Server Components & API Routes)
// ============================================================

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Creates a Supabase client for use in Server Components and API routes.
 *
 * Each call creates a fresh client so there is no shared mutable state
 * across requests in a serverless environment.
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}

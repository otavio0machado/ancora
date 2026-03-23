// ============================================================
// Supabase browser client (Client Components)
// Lazy-initialized to avoid build-time errors when env vars are missing
// ============================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let _supabase: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> | null {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn("[Âncora] Supabase env vars not set. Database features disabled.");
    return null;
  }

  _supabase = createClient<Database>(url, key);
  return _supabase;
}

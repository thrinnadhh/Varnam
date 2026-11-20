import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/db";

/**
 * Client-side Supabase Browser Client
 * Completely isolated from server-only APIs (no next/headers)
 * Resilient fallback for prerendering build phases
 */
export function createBrowserSupabaseClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54341";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder";

  return createBrowserClient<Database>(url, anonKey);
}

export const createClient = createBrowserSupabaseClient;

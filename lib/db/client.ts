import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/db";

/**
 * Client-side Supabase Browser Client
 * Completely isolated from server-only APIs (no next/headers)
 * Resilient fallback for prerendering build phases
 */
export function createBrowserSupabaseClient() {
  const isBrowser = typeof window !== "undefined";
  const isLocalHost = isBrowser && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // If no envUrl, or if envUrl points to local 127.0.0.1 while browsing on a remote domain, avoid mixed-content hangs
  const url =
    envUrl && (!envUrl.includes("127.0.0.1") || isLocalHost)
      ? envUrl
      : isLocalHost
      ? "http://127.0.0.1:54341"
      : "https://placeholder-project.supabase.co";

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder";

  const fetchWithTimeout = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === "string" && input.includes("placeholder-project.supabase.co")) {
      return Promise.reject(new Error("Supabase credentials not configured in cloud deployment"));
    }
    const signal = init?.signal || AbortSignal.timeout(3000);
    return fetch(input, { ...init, signal });
  };

  return createBrowserClient<Database>(url, anonKey, {
    global: { fetch: fetchWithTimeout },
  });
}

export const createClient = createBrowserSupabaseClient;

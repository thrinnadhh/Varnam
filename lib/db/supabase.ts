import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/db";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Checks whether Supabase is configured with a reachable endpoint.
 * In production or on Vercel, localhost/127.0.0.1 is not reachable.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      return false;
    }
    return true; // Local development default
  }
  if ((process.env.VERCEL || process.env.NODE_ENV === "production") && (url.includes("127.0.0.1") || url.includes("localhost"))) {
    return false;
  }
  return true;
}

/**
 * Server Component & Server Action Client with Cookie handling and strict timeout guards
 */
export async function createServerSupabaseClient() {
  let cookieStore: Awaited<ReturnType<typeof cookies>> | null = null;
  try {
    cookieStore = await cookies();
  } catch {
    // Called outside request scope or in static generation context
  }

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54341";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

  // Enforce a strict 3-second network timeout so unconfigured endpoints never hang requests
  const fetchWithTimeout = (input: RequestInfo | URL, init?: RequestInit) => {
    const signal = init?.signal || AbortSignal.timeout(3000);
    return fetch(input, { ...init, signal });
  };

  if (!cookieStore) {
    return createSupabaseClient<Database>(url, anonKey, {
      global: { fetch: fetchWithTimeout },
    });
  }

  return createServerClient<Database>(
    url,
    anonKey,
    {
      global: { fetch: fetchWithTimeout },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );
}

/**
 * Privileged Service-Role Client (Strictly for webhook verification & server background jobs)
 */
export function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for privileged database operations"
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Shared test environment loader for Varnam test suites
// Reads credentials from process.env and .env.local without hardcoding secrets in test files.

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // Environment variables already present in process.env
  }
}

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";

export const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function assertTestCredentials() {
  if (!SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY environment variable is required. Ensure .env.local is populated."
    );
  }
  if (!ANON_KEY) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required. Ensure .env.local is populated."
    );
  }
}

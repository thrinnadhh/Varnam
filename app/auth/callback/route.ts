import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabase";
import { getSafeRedirectUrl } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next");
  const safeNext = getSafeRedirectUrl(rawNext, "/account");

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
    }
  }

  // Fallback if code exchange fails or is missing
  return NextResponse.redirect(new URL("/login?error=auth_callback_failed", requestUrl.origin));
}

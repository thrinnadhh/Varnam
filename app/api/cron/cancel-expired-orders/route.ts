import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/db/supabase";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.rpc("cancel_expired_orders");

  if (error) {
    console.error("Cron cancel_expired_orders execution error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    cancelledOrdersCount: data || 0,
    timestamp: new Date().toISOString(),
  });
}

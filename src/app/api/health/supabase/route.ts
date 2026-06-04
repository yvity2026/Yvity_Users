import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Quick check that YVITY Gold can reach your Supabase project. */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? null;
  const configured = isSupabaseConfigured();

  if (!configured) {
    return NextResponse.json({
      ok: false,
      configured: false,
      url,
      message:
        "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local, then restart npm run dev",
    });
  }

  const supabase = getAdminClientOrNull();
  if (!supabase) {
    return NextResponse.json({
      ok: false,
      configured: false,
      url,
      message: "Supabase client could not be created",
    });
  }

  const { count, error } = await supabase
    .from("advisor_profiles")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({
      ok: false,
      configured: true,
      url,
      message: error.message,
      hint:
        error.message.includes("does not exist") || error.code === "42P01"
          ? "Run supabase/yvity_gold_e2e_schema.sql in the SQL Editor first"
          : "Check service role key and RLS; server routes use service role",
    });
  }

  return NextResponse.json({
    ok: true,
    configured: true,
    url,
    advisor_profiles_count: count ?? 0,
    message: "Connected to Supabase",
  });
}

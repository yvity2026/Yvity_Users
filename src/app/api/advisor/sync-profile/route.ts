import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/session";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import { updateUserProfileFields } from "@/lib/server/supabase/platform-supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/advisor/sync-profile
 * Force-writes name/city/profession from the current session into the Supabase
 * users table so the advisor appears correctly in city search results.
 */
export async function POST() {
  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  if (!useSupabasePersistence()) {
    return NextResponse.json({ success: true, message: "Local mode — no sync needed" });
  }

  try {
    await updateUserProfileFields(session.id, {
      name: session.name || undefined,
      city: session.city || undefined,
      profession: session.profession || undefined,
    });
    return NextResponse.json({ success: true, synced: { name: session.name, city: session.city, profession: session.profession } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 },
    );
  }
}

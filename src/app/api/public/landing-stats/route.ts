import { NextResponse } from "next/server";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import { loadLandingStatsFromDb } from "@/lib/server/supabase/platform-supabase";

export async function GET() {
  if (useSupabasePersistence()) {
    try {
      const data = await loadLandingStatsFromDb();
      return NextResponse.json({ success: true, data });
    } catch (error) {
      console.error("[landing-stats]", error);
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      verifiedAdvisors: 0,
      citiesCovered: 0,
      verifiedReviews: 0,
    },
  });
}

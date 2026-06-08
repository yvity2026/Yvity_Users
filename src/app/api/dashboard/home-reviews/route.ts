import { NextResponse } from "next/server";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import { loadRecentHomeReviewsFromDb } from "@/lib/server/supabase/platform-supabase";

export async function GET() {
  if (useSupabasePersistence()) {
    try {
      const data = await loadRecentHomeReviewsFromDb();
      return NextResponse.json({ success: true, data });
    } catch (error) {
      console.error("[home-reviews]", error);
    }
  }

  return NextResponse.json({ success: true, data: [] });
}

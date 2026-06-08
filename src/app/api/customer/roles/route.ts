import { NextResponse } from "next/server";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import { loadAdvisorRolesFromDb } from "@/lib/server/supabase/platform-supabase";

export async function GET() {
  if (useSupabasePersistence()) {
    try {
      const data = await loadAdvisorRolesFromDb();
      return NextResponse.json({ success: true, data });
    } catch (error) {
      console.error("[customer/roles]", error);
    }
  }

  return NextResponse.json({
    success: true,
    data: [
      { id: "role-life", title: "Life Insurance Advisor" },
      { id: "role-health", title: "Health Insurance Advisor" },
      { id: "role-general", title: "General Insurance Advisor" },
    ],
  });
}

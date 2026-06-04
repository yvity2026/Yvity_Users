import { NextResponse } from "next/server";

/** Mock advisor role list for workspace setup (until Supabase advisor_roles is wired). */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      { id: "role-life", title: "Life Insurance Advisor" },
      { id: "role-health", title: "Health Insurance Advisor" },
      { id: "role-general", title: "General Insurance Advisor" },
    ],
  });
}

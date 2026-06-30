import { NextResponse } from "next/server";
import { getAmbassadorDashboardForUser } from "@/lib/server/referrals-store";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    const data = await getAmbassadorDashboardForUser(session.id);

    return NextResponse.json({
      success: true,
      isAmbassador: true,
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load ambassador data";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

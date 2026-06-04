import { NextResponse } from "next/server";
import {
  approveAdvisorProfile,
  advisorProfileToApi,
} from "@/lib/server/advisor-profile-store";
import { getSessionUser } from "@/lib/server/session";

/** Development-only: mark the signed-in advisor profile as approved. */
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ success: false, message: "Not available" }, { status: 403 });
  }

  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
  }

  const profile = await approveAdvisorProfile(session.id);
  if (!profile) {
    return NextResponse.json(
      { success: false, message: "No advisor profile to approve" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Advisor profile approved",
    data: advisorProfileToApi(profile),
  });
}

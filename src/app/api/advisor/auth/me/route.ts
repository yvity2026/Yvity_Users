import { NextResponse } from "next/server";
import {
  advisorProfileToApi,
  getAdvisorProfileForUser,
} from "@/lib/server/advisor-profile-store";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionUser();

  if (!session?.id) {
    return NextResponse.json({ success: true, data: null });
  }

  const profile = await getAdvisorProfileForUser(session.id);

  if (!profile) {
    return NextResponse.json({ success: true, data: null });
  }

  return NextResponse.json({
    success: true,
    data: advisorProfileToApi(profile),
  });
}

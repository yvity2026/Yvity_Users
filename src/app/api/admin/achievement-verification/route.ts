import { NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import {
  approveAchievementVerification,
  listPendingAchievementVerifications,
  rejectAchievementVerification,
} from "@/lib/server/admin-achievement-approvals";

export const runtime = "nodejs";

/** GET /api/admin/achievement-verification — list pending/rejected submissions */
export async function GET() {
  if (!(await requireSession())) return unauthorized();
  const data = await listPendingAchievementVerifications();
  return NextResponse.json({ data });
}

type ReviewBody = {
  advisorId: string;
  achievementId: string;
  action: "approve" | "reject";
  reason?: string;
};

/** POST /api/admin/achievement-verification — approve or reject */
export async function POST(request: Request) {
  if (!(await requireSession())) return unauthorized();

  const body = (await request.json().catch(() => null)) as ReviewBody | null;
  if (
    !body ||
    !body.advisorId ||
    !body.achievementId ||
    (body.action !== "approve" && body.action !== "reject")
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (body.action === "reject" && !body.reason?.trim()) {
    return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
  }

  if (body.action === "approve") {
    await approveAchievementVerification(body.advisorId, body.achievementId);
  } else {
    await rejectAchievementVerification(body.advisorId, body.achievementId, body.reason!.trim());
  }

  return NextResponse.json({ ok: true });
}

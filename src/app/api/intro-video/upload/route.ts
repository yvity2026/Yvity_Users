import { NextResponse } from "next/server";
import { canUseIntroVideo, canUseIntroVideoDuration } from "@/lib/advisor-membership/plan-enforcement";
import { getAdvisorPlanContext } from "@/lib/advisor-membership/plan-enforcement-server";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { saveIntroVideoUpload } from "@/lib/server/uploads";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.id) return unauthorized();

  const planCtx = await getAdvisorPlanContext(session.id);
  if (planCtx) {
    const enabled = canUseIntroVideo(planCtx.limits, planCtx.planId);
    if (!enabled.ok) {
      return NextResponse.json(
        { error: enabled.reason ?? "Intro video is not available on your plan." },
        { status: 403 },
      );
    }
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const durationRaw = String(formData.get("durationSeconds") ?? "").trim();
    const durationSeconds = durationRaw ? Number(durationRaw) : 0;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (planCtx) {
      if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
        return NextResponse.json(
          { error: "Video duration is required to verify your plan limit." },
          { status: 400 },
        );
      }
      const durationCheck = canUseIntroVideoDuration(
        planCtx.limits,
        durationSeconds,
        planCtx.planId,
      );
      if (!durationCheck.ok) {
        return NextResponse.json(
          { error: durationCheck.reason ?? "Intro video exceeds plan duration limit." },
          { status: 403 },
        );
      }
    }

    const { url, filename, mimeType } = await saveIntroVideoUpload(file, session.id);
    return NextResponse.json({ ok: true, url, filename, mimeType });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { normalizeAdvisorSettings } from "@/lib/advisor-settings/normalize";
import type { AdvisorSettings } from "@/lib/advisor-settings/types";
import {
  isThemeAllowed,
  validateIntroVideoSettings,
} from "@/lib/advisor-membership/plan-enforcement";
import { getAdvisorPlanContext } from "@/lib/advisor-membership/plan-enforcement-server";
import { parseDurationLabelToSeconds } from "@/lib/intro-video";
import { unauthorized, requireSession } from "@/lib/server/api-auth";
import {
  loadAdvisorSettings,
  saveAdvisorSettings,
} from "@/lib/server/advisor-settings-persistence";

export async function GET() {
  const data = await loadAdvisorSettings();
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const session = await requireSession();
  if (!session?.id) return unauthorized();

  let body: { data?: AdvisorSettings };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.data) {
    return NextResponse.json({ error: "Missing settings data" }, { status: 400 });
  }

  const normalized = normalizeAdvisorSettings(body.data);
  const planCtx = await getAdvisorPlanContext(session.id);
  if (planCtx && !isThemeAllowed(planCtx.limits, normalized.appearance.theme)) {
    return NextResponse.json(
      { error: "This profile theme is not available on your current plan." },
      { status: 403 },
    );
  }

  if (planCtx) {
    const introCheck = validateIntroVideoSettings(
      planCtx.limits,
      planCtx.planId,
      normalized.introVideo,
      parseDurationLabelToSeconds,
    );
    if (!introCheck.ok) {
      return NextResponse.json(
        { error: introCheck.reason ?? "Intro video is not allowed on your plan." },
        { status: 403 },
      );
    }
  }

  const saved = await saveAdvisorSettings(normalized);
  return NextResponse.json({ ok: true, data: saved });
}

import { NextResponse } from "next/server";
import {
  canAddGalleryPhoto,
  filterGalleryForPublicDisplay,
} from "@/lib/advisor-membership/plan-enforcement";
import { getAdvisorPlanContext } from "@/lib/advisor-membership/plan-enforcement-server";
import { resolvePlanLimitsAsync } from "@/lib/advisor-membership/plan-limits-server";
import { getGlobalFeatureFlags } from "@/lib/server/feature-controls-store";
import type { GalleryItem } from "@/lib/gallery-types";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { getAdvisorProfileForUser } from "@/lib/server/advisor-profile-store";
import {
  isViewingOwnAdvisorData,
  resolveAdvisorDataUserId,
} from "@/lib/server/public-view-context";
import { getSessionUser } from "@/lib/server/session";
import { loadGalleryForUser, saveGalleryForUser } from "@/lib/server/section-persistence";

export async function GET() {
  const dataUserId = await resolveAdvisorDataUserId();
  const items = await loadGalleryForUser(dataUserId);

  const isOwner = await isViewingOwnAdvisorData();
  if (isOwner || !dataUserId) {
    return NextResponse.json({ data: items });
  }

  const profile = await getAdvisorProfileForUser(dataUserId);
  const limits = await resolvePlanLimitsAsync(profile?.subscription_plan, profile?.account_status);
  return NextResponse.json({ data: filterGalleryForPublicDisplay(limits, items) });
}

export async function PUT(request: Request) {
  const session = await getSessionUser();
  if (!session?.id) return unauthorized();

  const globalFlags = await getGlobalFeatureFlags();
  if (!globalFlags.galleryUploadsEnabled) {
    return NextResponse.json({ error: "Gallery uploads are temporarily unavailable." }, { status: 503 });
  }

  const body = (await request.json()) as { data?: GalleryItem[] };
  if (!body.data || !Array.isArray(body.data)) {
    return NextResponse.json({ error: "Invalid gallery data" }, { status: 400 });
  }

  const planCtx = await getAdvisorPlanContext(session.id);
  if (planCtx) {
    const check = canAddGalleryPhoto(planCtx.limits, body.data.length, planCtx.planId);
    if (!check.ok && body.data.length > (planCtx.limits.galleryPhotos ?? Infinity)) {
      return NextResponse.json({ error: check.reason ?? "Gallery photo limit reached." }, { status: 403 });
    }
  }

  let data: Awaited<ReturnType<typeof saveGalleryForUser>>;
  try {
    data = await saveGalleryForUser(session.id, body.data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[gallery PUT]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data });
}

import { NextResponse } from "next/server";
import { filterTestimonialsForPublicDisplay } from "@/lib/advisor-membership/content-visibility";
import { resolvePlanLimits } from "@/lib/advisor-membership/plan-limits";
import type { TestimonialItem } from "@/lib/sections/types";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { getAdvisorProfileForUser } from "@/lib/server/advisor-profile-store";
import {
  isViewingOwnAdvisorData,
  resolveAdvisorDataUserId,
} from "@/lib/server/public-view-context";
import { getSessionUser } from "@/lib/server/session";
import { loadTestimonials, saveTestimonials } from "@/lib/server/testimonials-persistence";

export async function GET() {
  const data = await loadTestimonials();
  const isOwner = await isViewingOwnAdvisorData();
  if (isOwner) {
    return NextResponse.json({ data });
  }

  const userId = await resolveAdvisorDataUserId();
  if (!userId) {
    return NextResponse.json({ data });
  }

  const profile = await getAdvisorProfileForUser(userId);
  const limits = resolvePlanLimits(profile?.subscription_plan, profile?.account_status);
  return NextResponse.json({ data: filterTestimonialsForPublicDisplay(limits, data) });
}

export async function PUT(request: Request) {
  const session = await requireSession();
  if (!session?.id) return unauthorized();
  const body = (await request.json()) as { data?: TestimonialItem[] };
  if (!body.data || !Array.isArray(body.data)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await saveTestimonials(body.data);
  return NextResponse.json({ ok: true, data: body.data });
}

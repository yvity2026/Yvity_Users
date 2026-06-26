import { NextResponse } from "next/server";
import type { AchievementItem } from "@/lib/sections/types";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { resolveAdvisorDataUserId } from "@/lib/server/public-view-context";
import { getSessionUser } from "@/lib/server/session";
import {
  loadAchievementsForUser,
  saveAchievementsForUser,
} from "@/lib/server/section-persistence";

export async function GET() {
  const dataUserId = await resolveAdvisorDataUserId();
  const data = await loadAchievementsForUser(dataUserId);
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  if (!(await requireSession())) return unauthorized();
  const session = await getSessionUser();
  if (!session?.id) return unauthorized();

  const body = (await request.json()) as { data?: AchievementItem[] };
  if (!body.data || !Array.isArray(body.data)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  let data: Awaited<ReturnType<typeof saveAchievementsForUser>>;
  try {
    data = await saveAchievementsForUser(session.id, body.data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[achievements PUT]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data });
}

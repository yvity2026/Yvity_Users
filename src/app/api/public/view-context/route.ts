import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getAdvisorProfileForUser } from "@/lib/server/advisor-profile-store";
import {
  isAdvisorProfileLive,
  PUBLIC_VIEW_COOKIE,
  publicViewCookieOptions,
  VIEWER_COOKIE,
  viewerCookieOptions,
} from "@/lib/server/public-view-context";
import { recordProfileView } from "@/lib/server/score-activity-persistence";
import { getSessionUser } from "@/lib/server/session";
import { cookies } from "next/headers";

export const runtime = "nodejs";

type Body = { userId?: string };

/** Sets the httpOnly cookie so section APIs load the viewed advisor's data. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  const userId = body?.userId?.trim();
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const profile = await getAdvisorProfileForUser(userId);
  if (!isAdvisorProfileLive(profile)) {
    return NextResponse.json({ error: "Profile not available" }, { status: 404 });
  }

  const session = await getSessionUser();
  const cookieStore = await cookies();

  let viewerKey = session?.id?.trim() || cookieStore.get(VIEWER_COOKIE)?.value?.trim() || "";
  const shouldSetViewerCookie = !session?.id?.trim() && !viewerKey;
  if (shouldSetViewerCookie) {
    viewerKey = randomUUID();
  }
  if (!viewerKey) {
    viewerKey = "anon";
  }

  void recordProfileView({ advisorUserId: userId, viewerKey });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(PUBLIC_VIEW_COOKIE, userId, publicViewCookieOptions());
  if (shouldSetViewerCookie) {
    response.cookies.set(VIEWER_COOKIE, viewerKey, viewerCookieOptions());
  }
  return response;
}

/** Clears the public-view cookie when leaving advisor profile pages. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PUBLIC_VIEW_COOKIE, "", { ...publicViewCookieOptions(), maxAge: 0 });
  return response;
}

import { NextResponse } from "next/server";
import {
  loadPublicViewAdvisorByUserId,
  resolveAdvisorDataUserId,
} from "@/lib/server/public-view-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Registration profile fields for the public profile being viewed. */
export async function GET() {
  const userId = await resolveAdvisorDataUserId();
  if (!userId) {
    return NextResponse.json({ payload: null });
  }

  const payload = await loadPublicViewAdvisorByUserId(userId);
  if (!payload) {
    return NextResponse.json({ payload: null });
  }

  return NextResponse.json({
    payload: {
      userId: payload.userId,
      profile: payload.profile,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      city: payload.city,
      state: payload.state,
      profession: payload.profession,
      about: payload.about ?? "",
      selfie_url: payload.selfie_url,
    },
  });
}

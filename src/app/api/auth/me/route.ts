import { NextResponse } from "next/server";
import { mergeSessionProfile, resolveRegisteredUser, toProfileUser } from "@/lib/server/profile";
import { recordAdvisorLoginDay } from "@/lib/server/score-activity-persistence";
import { getSessionUser } from "@/lib/server/session";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ user: null });
  }

  const registered = resolveRegisteredUser(sessionUser);
  const merged = mergeSessionProfile(sessionUser, registered);
  const user = toProfileUser(merged, registered);

  if (user.id) {
    void recordAdvisorLoginDay(user.id);
  }

  return NextResponse.json({ user });
}

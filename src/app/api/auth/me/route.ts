import { NextResponse } from "next/server";
import { mergeSessionProfile, resolveRegisteredUser, toProfileUser } from "@/lib/server/profile";
import { getSessionUser } from "@/lib/server/session";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ user: null });
  }

  const registered = resolveRegisteredUser(sessionUser);
  const merged = mergeSessionProfile(sessionUser, registered);

  return NextResponse.json({
    user: toProfileUser(merged, registered),
  });
}

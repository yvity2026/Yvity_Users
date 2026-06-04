import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getIdentityRefreshStatus } from "@/lib/identity/refreshPolicy";
import {
  mergeSessionProfile,
  toProfileUser,
  updateRegisteredIdentityRefresh,
} from "@/lib/server/profile";
import { toAuthUser } from "@/lib/server/registration";
import { getSessionUser, SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.id && !session?.identifier) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      verificationSelfieUrl?: string;
      updateProfilePhoto?: boolean;
    };

    const verificationSelfieUrl = String(body?.verificationSelfieUrl || "").trim();
    const updateProfilePhoto = Boolean(body?.updateProfilePhoto);

    if (!verificationSelfieUrl) {
      return NextResponse.json(
        { error: "A verification selfie is required" },
        { status: 400 },
      );
    }

    const updated = updateRegisteredIdentityRefresh(session, {
      verificationSelfieUrl,
      updateProfilePhoto,
    });

    if (!updated) {
      return NextResponse.json({ error: "Account record not found" }, { status: 404 });
    }

    const merged = mergeSessionProfile(session, updated);
    const nextSession = { ...merged, ...toAuthUser(updated) };
    const profileUser = toProfileUser(nextSession, updated);
    const identityRefresh = getIdentityRefreshStatus(profileUser);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, JSON.stringify(nextSession), sessionCookieOptions());

    return NextResponse.json({
      success: true,
      message:
        "Your identity is verified for another year. You can keep your existing profile photo or update it separately anytime.",
      data: { ...profileUser, identityRefresh },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to refresh identity" },
      { status: 500 },
    );
  }
}

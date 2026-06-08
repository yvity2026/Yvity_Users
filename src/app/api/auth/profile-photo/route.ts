import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { normalizeIndianMobile } from "@/lib/server/registration";
import {
  mergeSessionProfile,
  resolveRegisteredUser,
  toProfileUser,
  updateRegisteredSelfie,
} from "@/lib/server/profile";
import { saveSelfieUpload } from "@/lib/server/uploads";
import { getSessionUser, SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.id && !session?.identifier) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  if (!cookieStore.get("yvity_sensitive_verified")?.value) {
    return NextResponse.json(
      {
        error:
          "Confirm with OTP on both your mobile and email before changing your profile photo.",
        code: "sensitive_verification_required",
      },
      { status: 403 },
    );
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!image || typeof (image as Blob).arrayBuffer !== "function") {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    if ((image as Blob).size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 });
    }

    const phone = normalizeIndianMobile(session.phone ?? session.identifier);
    const ownerKey = session.id || phone || "user";
    const fileKey = `${phone || session.id || "user"}-${randomUUID().slice(0, 8)}.jpg`;
    const buffer = Buffer.from(await (image as Blob).arrayBuffer());
    const saved = await saveSelfieUpload({
      buffer,
      fileKey,
      ownerKey,
      contentType: "image/jpeg",
    });

    const registered = updateRegisteredSelfie(session, saved.url);
    const nextSession = mergeSessionProfile({ ...session, selfie_url: saved.url }, registered);

    cookieStore.set(SESSION_COOKIE, JSON.stringify(nextSession), sessionCookieOptions());

    return NextResponse.json({
      success: true,
      message: "Profile photo updated",
      data: toProfileUser(nextSession, registered ?? resolveRegisteredUser(session)),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update photo" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  mergeSessionProfile,
  toProfileUser,
  updateRegisteredEmail,
} from "@/lib/server/profile";
import {
  consumeOtp,
  normalizeEmail,
  storeOtp,
} from "@/lib/server/registration";
import { OTP_PURPOSE } from "@/lib/server/otp/purposes";
import { getSessionUser, SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.id && !session?.identifier) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    action?: string;
    newEmail?: string;
    otp?: string;
  };
  const action = String(body.action || "send");
  const newEmail = normalizeEmail(body.newEmail ?? "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  if (action === "send") {
    try {
      const result = await storeOtp(newEmail, OTP_PURPOSE.CHANGE_EMAIL);
      return NextResponse.json({
        success: true,
        message: result.message ?? "Verification code sent to your email.",
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Unable to send verification code" },
        { status: 502 },
      );
    }
  }

  const otp = String(body.otp || "").trim();
  if (!(await consumeOtp(newEmail, OTP_PURPOSE.CHANGE_EMAIL, otp))) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
  }

  const { user: registered, error } = updateRegisteredEmail(session, newEmail);
  if (error) {
    return NextResponse.json({ error }, { status: 409 });
  }

  const nextSession = mergeSessionProfile({ ...session, email: newEmail }, registered);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(nextSession), sessionCookieOptions());

  return NextResponse.json({
    success: true,
    message: "Email updated",
    data: toProfileUser(nextSession, registered),
  });
}

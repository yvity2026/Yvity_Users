import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { issueOtp, verifyIssuedOtp } from "@/lib/server/otp/service";
import { OTP_PURPOSE } from "@/lib/server/otp/purposes";
import { resolveRegisteredUser } from "@/lib/server/profile";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SENSITIVE_COOKIE = "yvity_sensitive_verified";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.id && !session?.identifier) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const registered = session ? resolveRegisteredUser(session) : null;
  const phone = registered?.phone?.trim() || session?.phone?.trim() || "";
  const email = registered?.email?.trim() || session?.email?.trim() || "";

  const body = (await request.json()) as {
    action?: string;
    phoneOtp?: string;
    emailOtp?: string;
  };
  const action = String(body.action || "send");

  if (action === "send") {
    if (!phone || !email) {
      return NextResponse.json(
        { error: "Both mobile and email are required on your profile before verification." },
        { status: 400 },
      );
    }

    const phoneResult = await issueOtp({
      identifier: phone,
      purpose: OTP_PURPOSE.SENSITIVE_PHONE,
      channel: "whatsapp",
    });
    if (!phoneResult.ok) {
      return NextResponse.json(
        { error: phoneResult.error ?? "Could not send mobile verification code." },
        { status: 502 },
      );
    }

    const emailResult = await issueOtp({
      identifier: email,
      purpose: OTP_PURPOSE.SENSITIVE_EMAIL,
      channel: "email",
    });
    if (!emailResult.ok) {
      return NextResponse.json(
        { error: emailResult.error ?? "Could not send email verification code." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification codes sent to your mobile and email.",
    });
  }

  if (action === "verify") {
    const phoneOtp = String(body.phoneOtp || "").trim();
    const emailOtp = String(body.emailOtp || "").trim();

    if (!phone || !email) {
      return NextResponse.json({ error: "Profile contact details missing." }, { status: 400 });
    }

    const phoneOk = await verifyIssuedOtp(phone, OTP_PURPOSE.SENSITIVE_PHONE, phoneOtp, "whatsapp");
    const emailOk = await verifyIssuedOtp(email, OTP_PURPOSE.SENSITIVE_EMAIL, emailOtp, "email");

    if (!phoneOk || !emailOk) {
      return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set(SENSITIVE_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 60,
    });

    return NextResponse.json({ success: true, verified: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

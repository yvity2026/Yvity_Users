import { NextResponse } from "next/server";
import {
  EMAIL_VERIFIED_COOKIE,
  consumeOtp,
  createVerifiedPayload,
  emailExists,
  normalizeEmail,
  packVerifiedPayload,
} from "@/lib/server/registration";
import { OTP_PURPOSE } from "@/lib/server/otp/purposes";
import { sessionCookieOptions } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; token?: string };
    const email = normalizeEmail(body.email ?? "");
    const token = String(body.token ?? "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(token)) {
      return NextResponse.json(
        { error: "Enter a valid email and 6-digit OTP" },
        { status: 400 },
      );
    }

    if (!(await consumeOtp(email, OTP_PURPOSE.EMAIL_SIGNUP, token))) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    if (emailExists(email)) {
      return NextResponse.json(
        { error: "This email is already linked to an account.", emailExists: true },
        { status: 409 },
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(
      EMAIL_VERIFIED_COOKIE,
      packVerifiedPayload(createVerifiedPayload(email)),
      sessionCookieOptions(30 * 60),
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to verify email OTP" },
      { status: 500 },
    );
  }
}

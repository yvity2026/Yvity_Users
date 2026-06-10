import { NextResponse } from "next/server";
import {
  EXISTING_EMAIL_MESSAGE,
  emailExists,
  normalizeEmail,
  storeOtp,
} from "@/lib/server/registration";
import { OTP_PURPOSE } from "@/lib/server/otp/purposes";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; flow?: string };
    const email = normalizeEmail(body.email ?? "");
    const flow = String(body.flow ?? "register");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    if (flow === "register" && emailExists(email)) {
      return NextResponse.json(
        { error: EXISTING_EMAIL_MESSAGE, emailExists: true },
        { status: 409 },
      );
    }

    const result = await storeOtp(email, OTP_PURPOSE.EMAIL_SIGNUP);
    return NextResponse.json({
      success: true,
      message: result.message ?? "Verification code sent to your email.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send email OTP" },
      { status: 502 },
    );
  }
}

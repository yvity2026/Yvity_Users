import { NextResponse } from "next/server";
import { verifyOtpCode } from "@/lib/server/auth";

/**
 * Verifies the OTP code submitted by the visitor in the Recommend
 * Advisor flow. This is an inline UX endpoint — the final POST to
 * `/api/recommendations` re-verifies the OTP server-side, so this
 * endpoint is purely a fast "is the code correct?" check so the modal
 * can enable the Submit button as soon as 6 digits are entered.
 */
export async function POST(request: Request) {
  let body: { otp?: string };
  try {
    body = (await request.json()) as { otp?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const otp = body.otp?.trim() ?? "";
  if (!verifyOtpCode(otp)) {
    return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}

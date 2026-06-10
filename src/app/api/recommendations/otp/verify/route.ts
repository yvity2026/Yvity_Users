import { NextResponse } from "next/server";
import { verifyIssuedOtp } from "@/lib/server/otp/service";
import { OTP_PURPOSE } from "@/lib/server/otp/purposes";

export async function POST(request: Request) {
  let body: { otp?: string; mobile?: string };
  try {
    body = (await request.json()) as { otp?: string; mobile?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const otp = body.otp?.trim() ?? "";
  const mobile = body.mobile?.trim() ?? "";

  if (!mobile) {
    return NextResponse.json({ error: "Mobile number is required." }, { status: 400 });
  }

  const valid = await verifyIssuedOtp(mobile, OTP_PURPOSE.RECOMMENDATION, otp, "whatsapp");
  if (!valid) {
    return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}

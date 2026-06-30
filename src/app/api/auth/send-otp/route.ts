import { NextResponse } from "next/server";
import {
  EXISTING_PHONE_MESSAGE,
  findUserByPhoneAsync,
  normalizeIndianMobile,
  phoneExistsAsync,
  storeOtp,
} from "@/lib/server/registration";

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  return handleRegistrationPhoneOtp(body);
}

async function handleRegistrationPhoneOtp(body: Record<string, unknown>) {
  const mobile = normalizeIndianMobile(String(body.phone ?? ""));
  const flow = String(body.flow ?? "login");

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return NextResponse.json({ error: "Enter a valid 10-digit phone number" }, { status: 400 });
  }

  if (flow === "login" && !(await findUserByPhoneAsync(mobile))) {
    return NextResponse.json(
      {
        error: "No account found with this mobile number",
        redirectToRegister: true,
      },
      { status: 404 },
    );
  }

  if (flow === "register" && (await phoneExistsAsync(mobile))) {
    return NextResponse.json(
      { error: EXISTING_PHONE_MESSAGE, phoneExists: true },
      { status: 409 },
    );
  }

  try {
    const result = await storeOtp(mobile, flow === "register" ? "signup" : "login");
    return NextResponse.json({
      success: true,
      message: result.message ?? "Verification code sent on WhatsApp.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send OTP" },
      { status: 502 },
    );
  }
}

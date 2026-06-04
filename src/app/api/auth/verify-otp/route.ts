import { NextResponse } from "next/server";
import {
  EXISTING_PHONE_MESSAGE,
  PHONE_VERIFIED_COOKIE,
  consumeOtp,
  createVerifiedPayload,
  findUserByPhone,
  normalizeIndianMobile,
  packVerifiedPayload,
  phoneExists,
  toAuthUser,
} from "@/lib/server/registration";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phone?: string;
      token?: string;
      deviceToken?: string;
      flow?: string;
    };

    const mobile = normalizeIndianMobile(body.phone ?? "");
    const token = String(body.token ?? "");
    const flow = String(body.flow ?? "login");

    if (!/^[6-9]\d{9}$/.test(mobile) || !/^\d{6}$/.test(token)) {
      return NextResponse.json(
        { error: "Enter a valid phone number and 6-digit OTP" },
        { status: 400 },
      );
    }

    const purpose = flow === "register" ? "signup" : "login";
    if (!consumeOtp(mobile, purpose, token)) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    if (flow === "register" && phoneExists(mobile)) {
      return NextResponse.json(
        { error: EXISTING_PHONE_MESSAGE, phoneExists: true },
        { status: 409 },
      );
    }

    if (flow === "login" && !findUserByPhone(mobile)) {
      return NextResponse.json(
        {
          error: "No account found with this mobile number",
          redirectToRegister: true,
        },
        { status: 404 },
      );
    }

    const existing = findUserByPhone(mobile);

    const response = NextResponse.json({
      success: true,
      userId: existing?.id ?? null,
      isNewUser: flow === "register",
      redirectUrl: flow === "login" ? "/dashboard" : null,
    });

    if (flow === "register") {
      response.cookies.set(
        PHONE_VERIFIED_COOKIE,
        packVerifiedPayload(createVerifiedPayload(mobile)),
        sessionCookieOptions(30 * 60),
      );
    } else if (existing) {
      response.cookies.set(
        SESSION_COOKIE,
        JSON.stringify(toAuthUser(existing)),
        sessionCookieOptions(),
      );
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to verify OTP" },
      { status: 500 },
    );
  }
}

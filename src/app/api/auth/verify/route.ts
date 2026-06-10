import { NextResponse } from "next/server";
import type { AuthUser } from "@/lib/auth-store";
import { isValidIdentifier, verifyOtpCode, type AuthMethod } from "@/lib/server/auth";
import { OTP_PURPOSE } from "@/lib/server/otp/purposes";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/session";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    method?: AuthMethod;
    identifier?: string;
    otp?: string;
  };
  const method = body.method;
  const identifier = body.identifier ?? "";
  const otp = body.otp ?? "";

  if (method !== "phone" && method !== "email") {
    return NextResponse.json({ error: "Invalid method" }, { status: 400 });
  }

  if (!isValidIdentifier(method, identifier)) {
    return NextResponse.json({ error: "Invalid identifier" }, { status: 400 });
  }

  const purpose = method === "phone" ? OTP_PURPOSE.LOGIN : OTP_PURPOSE.EMAIL_SIGNUP;
  if (!(await verifyOtpCode(identifier, purpose, otp))) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
  }

  const user: AuthUser = {
    identifier: identifier.trim(),
    method,
    loggedInAt: Date.now(),
  };

  const response = NextResponse.json({ ok: true, user });
  response.cookies.set(SESSION_COOKIE, JSON.stringify(user), sessionCookieOptions());
  return response;
}

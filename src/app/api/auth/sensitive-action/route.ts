import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DUMMY_OTP } from "@/lib/constants";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SENSITIVE_COOKIE = "yvity_sensitive_verified";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.id && !session?.identifier) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    action?: string;
    phoneOtp?: string;
    emailOtp?: string;
  };
  const action = String(body.action || "send");

  if (action === "send") {
    return NextResponse.json({
      success: true,
      message: `Demo OTP sent. Use ${DUMMY_OTP} for mobile and email.`,
    });
  }

  if (action === "verify") {
    const phoneOtp = String(body.phoneOtp || "").trim();
    const emailOtp = String(body.emailOtp || "").trim();

    if (phoneOtp !== DUMMY_OTP || emailOtp !== DUMMY_OTP) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
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

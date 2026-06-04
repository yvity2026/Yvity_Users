import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DUMMY_OTP } from "@/lib/constants";
import {
  mergeSessionProfile,
  toProfileUser,
  updateRegisteredMobile,
} from "@/lib/server/profile";
import {
  consumeOtp,
  normalizeIndianMobile,
  storeOtp,
} from "@/lib/server/registration";
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
    newMobile?: string;
    otp?: string;
  };
  const action = String(body.action || "send");
  const newMobile = normalizeIndianMobile(body.newMobile ?? "");

  if (!/^[6-9]\d{9}$/.test(newMobile)) {
    return NextResponse.json({ error: "Enter a valid 10-digit mobile" }, { status: 400 });
  }

  if (action === "send") {
    storeOtp(newMobile, "change-mobile");
    return NextResponse.json({
      success: true,
      message: `OTP sent. Demo code: ${DUMMY_OTP}`,
    });
  }

  const otp = String(body.otp || "").trim();
  if (!consumeOtp(newMobile, "change-mobile", otp)) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
  }

  const { user: registered, error } = updateRegisteredMobile(session, newMobile);
  if (error) {
    return NextResponse.json({ error }, { status: 409 });
  }

  const nextSession = mergeSessionProfile(
    { ...session, phone: newMobile, identifier: newMobile, method: "phone" },
    registered,
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(nextSession), sessionCookieOptions());

  return NextResponse.json({
    success: true,
    message: "Mobile number updated",
    data: toProfileUser(nextSession, registered),
  });
}

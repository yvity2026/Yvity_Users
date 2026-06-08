import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  EMAIL_VERIFIED_COOKIE,
  EXISTING_EMAIL_MESSAGE,
  EXISTING_PHONE_MESSAGE,
  PHONE_VERIFIED_COOKIE,
  emailExists,
  normalizeEmail,
  normalizeIndianMobile,
  phoneExists,
  readVerifiedCookie,
  registerUserRecord,
  toAuthUser,
} from "@/lib/server/registration";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: string;
      phone?: string;
      dob?: string;
      gender?: string;
      email?: string;
      city?: string;
      state?: string;
      profession?: string;
      selfieUrl?: string;
      referralCode?: string;
    };

    const mobile = normalizeIndianMobile(body.phone ?? "");
    const email = normalizeEmail(body.email ?? "");

    if (!body.fullName?.trim() || !/^[6-9]\d{9}$/.test(mobile) || !email) {
      return NextResponse.json({ error: "Missing required registration details" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const phoneCookie = cookieStore.get(PHONE_VERIFIED_COOKIE)?.value;
    const emailCookie = cookieStore.get(EMAIL_VERIFIED_COOKIE)?.value;

    if (!readVerifiedCookie(phoneCookie, mobile)) {
      return NextResponse.json(
        { error: "Please verify your phone OTP before registration" },
        { status: 401 },
      );
    }

    if (!readVerifiedCookie(emailCookie, email)) {
      return NextResponse.json(
        { error: "Please verify your email OTP before registration" },
        { status: 401 },
      );
    }

    if (phoneExists(mobile)) {
      return NextResponse.json(
        { error: EXISTING_PHONE_MESSAGE, phoneExists: true, redirectToLogin: true },
        { status: 409 },
      );
    }

    if (emailExists(email)) {
      return NextResponse.json(
        { error: EXISTING_EMAIL_MESSAGE, emailExists: true },
        { status: 409 },
      );
    }

    const user = registerUserRecord({
      fullName: body.fullName,
      phone: mobile,
      dob: body.dob ?? "",
      gender: body.gender ?? "",
      email,
      city: body.city ?? "",
      state: body.state ?? "",
      profession: body.profession ?? "",
      selfieUrl: body.selfieUrl ?? null,
      referralCode: body.referralCode?.trim() || null,
    });

    const authUser = toAuthUser(user);
    const response = NextResponse.json({
      success: true,
      userId: user.id,
      redirectUrl: "/dashboard",
    });

    response.cookies.set(SESSION_COOKIE, JSON.stringify(authUser), sessionCookieOptions());
    response.cookies.set(PHONE_VERIFIED_COOKIE, "", { ...sessionCookieOptions(0), maxAge: 0 });
    response.cookies.set(EMAIL_VERIFIED_COOKIE, "", { ...sessionCookieOptions(0), maxAge: 0 });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    const phoneExistsErr = message === EXISTING_PHONE_MESSAGE;
    const emailExistsErr = message === EXISTING_EMAIL_MESSAGE;
    return NextResponse.json(
      {
        error: message,
        phoneExists: phoneExistsErr,
        emailExists: emailExistsErr,
        redirectToLogin: phoneExistsErr,
      },
      { status: 409 },
    );
  }
}

import { NextResponse } from "next/server";
import {
  EXISTING_EMAIL_MESSAGE,
  EXISTING_PHONE_MESSAGE,
  emailExists,
  normalizeEmail,
  normalizeIndianMobile,
  phoneExists,
} from "@/lib/server/registration";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string; email?: string };
    const mobile = normalizeIndianMobile(body.phone ?? "");
    const email = normalizeEmail(body.email ?? "");

    const shouldCheckPhone = /^[6-9]\d{9}$/.test(mobile);
    const shouldCheckEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!shouldCheckPhone && !shouldCheckEmail) {
      return NextResponse.json(
        { error: "Enter a valid phone number or email address" },
        { status: 400 },
      );
    }

    const phoneTaken = shouldCheckPhone && phoneExists(mobile);
    const emailTaken = shouldCheckEmail && emailExists(email);

    return NextResponse.json({
      success: true,
      phoneExists: phoneTaken,
      emailExists: emailTaken,
      ...(phoneTaken
        ? {
            redirectToLogin: true,
            phoneMessage: EXISTING_PHONE_MESSAGE,
          }
        : {}),
      ...(emailTaken ? { emailMessage: EXISTING_EMAIL_MESSAGE } : {}),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to check availability" },
      { status: 500 },
    );
  }
}

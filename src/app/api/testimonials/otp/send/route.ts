import { NextResponse } from "next/server";
import { DUMMY_OTP } from "@/lib/constants";
import {
  ADVISOR_SELF_TESTIMONIAL_MESSAGE,
  rejectAdvisorSelfSubmissionForCurrentProfile,
} from "@/lib/server/advisor-self-submission-guard";

function isValidMobile(mobile: string): boolean {
  const digits = mobile.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/** Demo OTP — always use code from DUMMY_OTP (see lib/constants). */
export async function POST(request: Request) {
  let body: { mobile?: string };
  try {
    body = (await request.json()) as { mobile?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const mobile = body.mobile?.trim() ?? "";
  if (!isValidMobile(mobile)) {
    return NextResponse.json({ error: "Enter a valid mobile number" }, { status: 400 });
  }

  const selfBlocked = await rejectAdvisorSelfSubmissionForCurrentProfile(
    mobile,
    ADVISOR_SELF_TESTIMONIAL_MESSAGE,
  );
  if (selfBlocked) return selfBlocked;

  // Demo: no SMS provider; client uses DUMMY_OTP for verification.
  return NextResponse.json({
    ok: true,
    message: `Demo OTP sent. Use ${DUMMY_OTP} to verify.`,
  });
}

import { NextResponse } from "next/server";
import {
  ADVISOR_SELF_TESTIMONIAL_MESSAGE,
  rejectAdvisorSelfSubmissionForCurrentProfile,
} from "@/lib/server/advisor-self-submission-guard";
import { issueOtp } from "@/lib/server/otp/service";
import { OTP_PURPOSE } from "@/lib/server/otp/purposes";

function isValidMobile(mobile: string): boolean {
  const digits = mobile.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

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

  const result = await issueOtp({
    identifier: mobile,
    purpose: OTP_PURPOSE.TESTIMONIAL,
    channel: "whatsapp",
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not send verification code." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: result.message ?? "Verification code sent on WhatsApp.",
  });
}

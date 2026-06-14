import { NextResponse } from "next/server";
import { contactInterestOptions, type ContactInterestId } from "@/lib/contact-config";
import {
  ADVISOR_SELF_CONTACT_MESSAGE,
  CONTACT_MONTHLY_DUPLICATE_MESSAGE,
} from "@/lib/contact/submission-limits";
import { unauthorized, requireSession } from "@/lib/server/api-auth";
import { appendContactInquiry, loadContactInquiries } from "@/lib/server/contact-persistence";
import { hasRecentContactInquiryFromMobile } from "@/lib/server/contact-inquiry-limits";
import {
  rejectAdvisorSelfSubmission,
} from "@/lib/server/advisor-self-submission-guard";
import { getAdvisorProfileForUser } from "@/lib/server/advisor-profile-store";
import { loadAdvisorSettings } from "@/lib/server/advisor-settings-persistence";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { resolveAdvisorDataUserId } from "@/lib/server/public-view-context";

const validIds = new Set(contactInterestOptions.map((o) => o.id));

export async function GET() {
  const user = await requireSession();
  if (!user?.id) return unauthorized();
  const data = await loadContactInquiries(user.id);
  return NextResponse.json({
    data: [...data].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  });
}

export async function POST(request: Request) {
  const advisorUserId = await resolveAdvisorDataUserId();
  if (!advisorUserId) {
    return NextResponse.json({ error: "Advisor profile not found." }, { status: 404 });
  }

  const [advisorSettings, profile] = await Promise.all([
    loadAdvisorSettings(advisorUserId),
    getAdvisorProfileForUser(advisorUserId),
  ]);
  const profileApproved = isAdvisorProfileApproved(profile);
  const allowSubmission =
    advisorSettings.contact.contactForm &&
    (profileApproved ||
      (advisorSettings.leads.acceptNewLeads &&
        advisorSettings.leads.publicProfileEnquiries));

  if (!allowSubmission) {
    return NextResponse.json(
      { error: "Contact form submissions are currently disabled." },
      { status: 403 },
    );
  }

  let body: {
    fullName?: string;
    mobile?: string;
    interests?: string[];
    message?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fullName = body.fullName?.trim() ?? "";
  const mobile = body.mobile?.trim() ?? "";
  const message = body.message?.trim();
  const interests = (body.interests ?? []).filter((id): id is ContactInterestId =>
    validIds.has(id as ContactInterestId),
  );

  if (fullName.length < 2) {
    return NextResponse.json({ error: "Please enter your full name" }, { status: 400 });
  }

  const digits = mobile.replace(/\D/g, "");
  if (digits.length < 10) {
    return NextResponse.json({ error: "Please enter a valid mobile number" }, { status: 400 });
  }

  if (interests.length === 0) {
    return NextResponse.json({ error: "Select at least one topic" }, { status: 400 });
  }

  const selfBlocked = await rejectAdvisorSelfSubmission(
    advisorUserId,
    mobile,
    ADVISOR_SELF_CONTACT_MESSAGE,
  );
  if (selfBlocked) return selfBlocked;

  if (await hasRecentContactInquiryFromMobile(advisorUserId, mobile)) {
    return NextResponse.json({ error: CONTACT_MONTHLY_DUPLICATE_MESSAGE }, { status: 409 });
  }

  const entry = await appendContactInquiry(advisorUserId, {
    fullName,
    mobile,
    interests,
    message: message || undefined,
  });

  return NextResponse.json({ ok: true, id: entry.id });
}

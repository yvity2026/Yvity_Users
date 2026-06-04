import { NextResponse } from "next/server";
import { contactInterestOptions, type ContactInterestId } from "@/lib/contact-config";
import { unauthorized, requireSession } from "@/lib/server/api-auth";
import { appendContactInquiry, loadContactInquiries } from "@/lib/server/contact-persistence";
import { loadAdvisorSettings } from "@/lib/server/advisor-settings-persistence";

const validIds = new Set(contactInterestOptions.map((o) => o.id));

export async function GET() {
  const user = await requireSession();
  if (!user) return unauthorized();
  const data = await loadContactInquiries();
  return NextResponse.json({
    data: [...data].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  });
}

export async function POST(request: Request) {
  const advisorSettings = await loadAdvisorSettings();
  if (!advisorSettings.leads.acceptNewLeads) {
    return NextResponse.json(
      { error: "This advisor is not accepting new enquiries at the moment." },
      { status: 403 },
    );
  }
  if (!advisorSettings.leads.publicProfileEnquiries || !advisorSettings.contact.contactForm) {
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

  const entry = await appendContactInquiry({
    fullName,
    mobile,
    interests,
    message: message || undefined,
  });

  return NextResponse.json({ ok: true, id: entry.id });
}

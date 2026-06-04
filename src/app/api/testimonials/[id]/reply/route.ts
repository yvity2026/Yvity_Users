import { NextResponse } from "next/server";
import { formatTestimonialDate } from "@/lib/testimonials/submit-utils";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { setTestimonialAdvisorReply } from "@/lib/server/testimonials-persistence";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireSession())) return unauthorized();

  const { id } = await context.params;
  let body: { text?: string };
  try {
    body = (await request.json()) as { text?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = body.text?.trim() ?? "";
  if (text.length < 2) {
    return NextResponse.json({ error: "Reply must be at least 2 characters." }, { status: 400 });
  }

  try {
    const data = await setTestimonialAdvisorReply(id, {
      text,
      repliedOn: formatTestimonialDate(),
    });
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireSession())) return unauthorized();

  const { id } = await context.params;
  try {
    const data = await setTestimonialAdvisorReply(id, null);
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
  }
}

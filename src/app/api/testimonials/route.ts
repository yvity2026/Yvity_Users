import { NextResponse } from "next/server";
import type { TestimonialItem } from "@/lib/sections/types";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { loadTestimonials, saveTestimonials } from "@/lib/server/testimonials-persistence";

export async function GET() {
  const data = await loadTestimonials();
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  if (!(await requireSession())) return unauthorized();
  const body = (await request.json()) as { data?: TestimonialItem[] };
  if (!body.data || !Array.isArray(body.data)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  await saveTestimonials(body.data);
  return NextResponse.json({ ok: true, data: body.data });
}

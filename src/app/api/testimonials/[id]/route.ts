import { NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { loadTestimonials, saveTestimonials } from "@/lib/server/testimonials-persistence";
import type { TestimonialService } from "@/lib/sections/types";

const VALID_SERVICES: TestimonialService[] = ["life", "health", "general", "mutual", "claim"];

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireSession())) return unauthorized();

  const { id } = await context.params;
  let body: { service?: string };
  try {
    body = (await request.json()) as { service?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const service = body.service as TestimonialService | undefined;
  if (!service || !VALID_SERVICES.includes(service)) {
    return NextResponse.json({ error: "Invalid service value" }, { status: 400 });
  }

  const list = await loadTestimonials();
  const index = list.findIndex((t) => t.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
  }

  const updated = { ...list[index], service };
  const next = [...list];
  next[index] = updated;
  await saveTestimonials(next);
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireSession())) return unauthorized();

  const { id } = await context.params;
  const list = await loadTestimonials();
  const index = list.findIndex((t) => t.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
  }

  const next = list.filter((t) => t.id !== id);
  await saveTestimonials(next);
  return NextResponse.json({ ok: true });
}

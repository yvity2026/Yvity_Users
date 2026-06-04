import { EMPTY_TESTIMONIALS } from "@/lib/empty-data";
import { normalizeTestimonials } from "@/lib/sections/normalize-testimonials";
import type { TestimonialAdvisorReply, TestimonialItem } from "@/lib/sections/types";
import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";
import { getSessionUser } from "@/lib/server/session";
import { testimonialsFileForUser } from "@/lib/server/user-data-files";

async function fileForSession(): Promise<string> {
  const session = await getSessionUser();
  return session?.id ? testimonialsFileForUser(session.id) : "testimonials-anonymous.json";
}

export async function loadTestimonials(): Promise<TestimonialItem[]> {
  const raw = await loadJsonFile<unknown>(await fileForSession(), EMPTY_TESTIMONIALS);
  return normalizeTestimonials(raw);
}

export async function saveTestimonials(data: TestimonialItem[]): Promise<void> {
  await saveJsonFile(await fileForSession(), data);
}

export async function appendPublishedTestimonial(item: TestimonialItem): Promise<TestimonialItem> {
  const list = await loadTestimonials();
  const published: TestimonialItem = {
    ...item,
    source: item.source ?? "customer",
    status: "published",
    verified: true,
  };
  await saveTestimonials([published, ...list]);
  return published;
}

export async function setTestimonialAdvisorReply(
  id: string,
  reply: TestimonialAdvisorReply | null,
): Promise<TestimonialItem> {
  const list = await loadTestimonials();
  const index = list.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Testimonial not found");

  const updated: TestimonialItem = {
    ...list[index],
    advisorReply: reply ?? undefined,
  };
  const next = [...list];
  next[index] = updated;
  await saveTestimonials(next);
  return updated;
}

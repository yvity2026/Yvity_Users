import { EMPTY_TESTIMONIALS } from "@/lib/empty-data";
import { normalizeTestimonials } from "@/lib/sections/normalize-testimonials";
import type { TestimonialAdvisorReply, TestimonialItem } from "@/lib/sections/types";
import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";
import { resolveAdvisorDataUserId } from "@/lib/server/public-view-context";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import {
  insertTestimonialToDb,
  loadTestimonialsFromDb,
  syncTestimonials,
  updateTestimonialReplyInDb,
} from "@/lib/server/supabase/sync-sections";
import { recordTestimonialSubmission } from "@/lib/server/testimonial-submission-limits";
import { testimonialsFileForUser } from "@/lib/server/user-data-files";

async function resolveAdvisorId(): Promise<string | null> {
  return resolveAdvisorDataUserId();
}

async function fileForAdvisor(advisorId: string | null): Promise<string> {
  return advisorId ? testimonialsFileForUser(advisorId) : "testimonials-anonymous.json";
}

export async function loadTestimonials(advisorUserId?: string): Promise<TestimonialItem[]> {
  const advisorId = advisorUserId ?? (await resolveAdvisorId());
  if (useSupabasePersistence() && advisorId) {
    return loadTestimonialsFromDb(advisorId);
  }

  const raw = await loadJsonFile<unknown>(await fileForAdvisor(advisorId), EMPTY_TESTIMONIALS);
  return normalizeTestimonials(raw);
}

export async function saveTestimonials(data: TestimonialItem[]): Promise<void> {
  const advisorId = await resolveAdvisorId();
  if (useSupabasePersistence() && advisorId) {
    await syncTestimonials(advisorId, data);
    return;
  }

  await saveJsonFile(await fileForAdvisor(advisorId), data);
}

export async function appendPublishedTestimonial(
  item: TestimonialItem,
  mobile = "0000000000",
): Promise<TestimonialItem> {
  const published: TestimonialItem = {
    ...item,
    source: item.source ?? "customer",
    status: "published",
    verified: true,
  };

  const advisorId = await resolveAdvisorId();
  if (useSupabasePersistence() && advisorId) {
    const saved = await insertTestimonialToDb(advisorId, published, mobile);
    return saved;
  }

  const list = await loadTestimonials();
  await saveJsonFile(await fileForAdvisor(advisorId), [published, ...list]);
  if (advisorId) {
    await recordTestimonialSubmission(advisorId, mobile, published.service);
  }
  return published;
}

export async function setTestimonialAdvisorReply(
  id: string,
  reply: TestimonialAdvisorReply | null,
): Promise<TestimonialItem> {
  const advisorId = await resolveAdvisorId();
  if (useSupabasePersistence() && advisorId) {
    const updated = await updateTestimonialReplyInDb(advisorId, id, reply?.text ?? null);
    if (!updated) throw new Error("Testimonial not found");
    return updated;
  }

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

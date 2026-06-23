import "server-only";

import type { GalleryItem } from "@/lib/gallery-types";
import type { AchievementItem, ServiceItem, TestimonialItem } from "@/lib/sections/types";
import { normalizeAchievements } from "@/lib/sections/normalize-achievements";
import { normalizeServices } from "@/lib/sections/normalize-services";
import { normalizeTestimonials } from "@/lib/sections/normalize-testimonials";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";
import { isUuid } from "@/lib/server/supabase/career-mapper";
import {
  buildKeyServicesPayload,
  serviceShortSummaryForDb,
} from "@/lib/advisor/service-item-meta";
import { embedGoldMeta } from "@/lib/server/supabase/gold-meta";
import {
  mapDbServices,
  mapDbTestimonials,
} from "@/lib/server/supabase/mappers";

const SERVICE_TYPE: Record<ServiceItem["category"], string> = {
  life: "life insurance",
  health: "health insurance",
  general: "general insurance",
  mutual: "mutual funds",
};

function serviceShortSummary(item: ServiceItem): string | null {
  return serviceShortSummaryForDb(item);
}


function client() {
  const supabase = getAdminClientOrNull();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

function parseExperienceYears(item: ServiceItem): number | null {
  if (item.serviceStartDate) {
    const y = Number(item.serviceStartDate.slice(0, 4));
    if (!Number.isNaN(y) && y > 1900) return Math.max(0, new Date().getFullYear() - y);
  }
  const match = item.experience.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

export async function loadServicesFromDb(advisorId: string): Promise<ServiceItem[]> {
  const { data, error } = await client()
    .from("advisor_services")
    .select("*")
    .eq("advisor_id", advisorId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return normalizeServices(mapDbServices((data ?? []) as Record<string, unknown>[]));
}

export async function loadAchievementsFromDb(advisorId: string): Promise<AchievementItem[]> {
  const { data, error } = await client()
    .from("advisor_profiles")
    .select("achievements_data")
    .eq("advisor_id", advisorId)
    .maybeSingle();

  if (error) throw new Error(`[achievements load] ${error.message}`);
  const raw = (data?.achievements_data as AchievementItem[] | null) ?? [];
  return normalizeAchievements(raw);
}

export async function loadGalleryFromDb(advisorId: string): Promise<GalleryItem[]> {
  const { data, error } = await client()
    .from("advisor_profiles")
    .select("gallery_data")
    .eq("advisor_id", advisorId)
    .maybeSingle();

  if (error) throw new Error(`[gallery load] ${error.message}`);
  return (data?.gallery_data as GalleryItem[] | null) ?? [];
}

export async function loadTestimonialsFromDb(advisorId: string): Promise<TestimonialItem[]> {
  const { data, error } = await client()
    .from("advisor_testimonials")
    .select("*")
    .eq("advisor_id", advisorId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return normalizeTestimonials(mapDbTestimonials((data ?? []) as Record<string, unknown>[]));
}

export function mapTestimonialItemToRow(
  advisorId: string,
  item: TestimonialItem,
  mobile = "0000000000",
): Record<string, unknown> {
  const meta = {
    source: item.source ?? "customer",
    service: item.service,
    profession: item.profession,
    location: item.location,
    submittedAt: item.submittedAt,
    audioDuration: item.audioDuration,
    videoDuration: item.videoDuration,
  };

  return {
    advisor_id: advisorId,
    name: item.name,
    mobile_number: mobile.replace(/\D/g, "").slice(-10) || "0000000000",
    testimonial_type: item.type,
    content: embedGoldMeta(item.quote, meta),
    media_url: item.mediaUrl ?? null,
    testimonial_rating: item.rating,
    status: item.status === "draft" ? "pending" : "approved",
    is_mobile_verified: item.memberBadge === "mobile-verified" || Boolean(item.verified),
    is_verified: Boolean(item.verified),
    reply_text: item.advisorReply?.text ?? null,
    reply_created_at: item.advisorReply?.repliedOn ?? null,
  };
}

export async function insertTestimonialToDb(
  advisorId: string,
  item: TestimonialItem,
  mobile: string,
): Promise<TestimonialItem> {
  const row = mapTestimonialItemToRow(advisorId, item, mobile);
  const { data, error } = await client()
    .from("advisor_testimonials")
    .insert(row)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return normalizeTestimonials([mapDbTestimonials([data as Record<string, unknown>])[0]!])[0]!;
}

export async function syncServices(advisorId: string, items: ServiceItem[]) {
  const supabase = client();
  const { data: existing, error: fetchErr } = await supabase
    .from("advisor_services")
    .select("id")
    .eq("advisor_id", advisorId);
  if (fetchErr) throw new Error(`[advisor_services] fetch failed: ${fetchErr.message}`);

  const payloadIds = new Set(items.filter((i) => isUuid(i.id)).map((i) => i.id));
  const toDelete = (existing ?? [])
    .map((r) => String(r.id))
    .filter((id) => !payloadIds.has(id));

  if (toDelete.length) {
    const { error: delErr } = await supabase
      .from("advisor_services")
      .delete()
      .eq("advisor_id", advisorId)
      .in("id", toDelete);
    if (delErr) throw new Error(`[advisor_services] delete failed: ${delErr.message}`);
  }

  for (const item of items) {
    const row = {
      advisor_id: advisorId,
      service_type: SERVICE_TYPE[item.category] ?? item.title,
      company: item.provider,
      experience_years: parseExperienceYears(item),
      from_year: item.serviceStartDate?.slice(0, 10) ?? null,
      no_of_clients: item.clients || null,
      number_of_climes: item.claims || null,
      key_services: buildKeyServicesPayload(item),
      short_summary: serviceShortSummary(item),
      company_logo_url: item.companyLogoUrl || null,
    };

    if (isUuid(item.id)) {
      const { error: updErr } = await supabase
        .from("advisor_services")
        .update(row)
        .eq("id", item.id)
        .eq("advisor_id", advisorId);
      if (updErr) throw new Error(`[advisor_services] update failed: ${updErr.message}`);
    } else {
      const { error: insErr } = await supabase.from("advisor_services").insert(row);
      if (insErr) throw new Error(`[advisor_services] insert failed: ${insErr.message}`);
    }
  }

  return loadServicesFromDb(advisorId);
}

export async function syncAchievements(advisorId: string, items: AchievementItem[]) {
  const { error } = await client()
    .from("advisor_profiles")
    .update({ achievements_data: items, updated_at: new Date().toISOString() })
    .eq("advisor_id", advisorId);

  if (error) throw new Error(`[achievements save] ${error.message}`);
  return normalizeAchievements(items);
}

export async function syncGallery(advisorId: string, items: GalleryItem[]) {
  const { error } = await client()
    .from("advisor_profiles")
    .update({ gallery_data: items, updated_at: new Date().toISOString() })
    .eq("advisor_id", advisorId);

  if (error) throw new Error(`[gallery save] ${error.message}`);
  return items;
}

export async function syncTestimonials(advisorId: string, items: TestimonialItem[]) {
  const supabase = client();
  const { data: existing } = await supabase
    .from("advisor_testimonials")
    .select("id")
    .eq("advisor_id", advisorId);

  const payloadIds = new Set(items.filter((i) => isUuid(i.id)).map((i) => i.id));
  const toDelete = (existing ?? [])
    .map((r) => String(r.id))
    .filter((id) => !payloadIds.has(id))
    .filter((id) => {
      const item = items.find((t) => t.id === id);
      return !item || item.source === "advisor";
    });

  if (toDelete.length) {
    await supabase
      .from("advisor_testimonials")
      .delete()
      .eq("advisor_id", advisorId)
      .in("id", toDelete);
  }

  for (const item of items) {
    if (item.source === "customer" && isUuid(item.id)) {
      if (item.advisorReply?.text) {
        await supabase
          .from("advisor_testimonials")
          .update({
            reply_text: item.advisorReply.text,
            reply_created_at: new Date().toISOString(),
          })
          .eq("id", item.id)
          .eq("advisor_id", advisorId);
      }
      continue;
    }

    if (item.source !== "advisor") continue;

    const row = mapTestimonialItemToRow(advisorId, item);

    if (isUuid(item.id)) {
      await supabase
        .from("advisor_testimonials")
        .update(row)
        .eq("id", item.id)
        .eq("advisor_id", advisorId);
    } else {
      await supabase.from("advisor_testimonials").insert(row);
    }
  }

  return loadTestimonialsFromDb(advisorId);
}

export async function updateTestimonialReplyInDb(
  advisorId: string,
  id: string,
  replyText: string | null,
): Promise<TestimonialItem | null> {
  const { data, error } = await client()
    .from("advisor_testimonials")
    .update({
      reply_text: replyText,
      reply_created_at: replyText ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("advisor_id", advisorId)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapDbTestimonials([data as Record<string, unknown>])[0] ?? null;
}

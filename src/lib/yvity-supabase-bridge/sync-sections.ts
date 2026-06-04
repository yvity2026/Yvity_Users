import "server-only";

import { createAdminClient } from "@/lib/supabase/adminClient";
import type { GalleryItem } from "@/yvity-gold/lib/gallery-types";
import type { AchievementItem, ServiceItem, TestimonialItem } from "@/yvity-gold/lib/sections/types";
import { isUuid } from "@/lib/yvity-gold/bridge/career-mapper";
import {
  mapDbAchievements,
  mapDbGallery,
  mapDbServices,
  mapDbTestimonials,
} from "@/lib/yvity-gold/bridge/mappers";
import { normalizeAchievements } from "@/yvity-gold/lib/sections/normalize-achievements";
import { normalizeServices } from "@/yvity-gold/lib/sections/normalize-services";
import { normalizeTestimonials } from "@/yvity-gold/lib/sections/normalize-testimonials";

const SERVICE_TYPE: Record<ServiceItem["category"], string> = {
  life: "life insurance",
  health: "health insurance",
  general: "general insurance",
  mutual: "mutual funds",
};

const ACHIEVEMENT_TYPE: Record<AchievementItem["category"], string> = {
  life: "life",
  health: "health",
  education: "education",
  other: "other",
};

function parseExperienceYears(item: ServiceItem): number | null {
  if (item.serviceStartDate) {
    const y = Number(item.serviceStartDate.slice(0, 4));
    if (!Number.isNaN(y) && y > 1900) return Math.max(0, new Date().getFullYear() - y);
  }
  const match = item.experience.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

export async function syncServices(advisorId: string, items: ServiceItem[]) {
  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("advisor_services")
    .select("id")
    .eq("advisor_id", advisorId);

  const payloadIds = new Set(items.filter((i) => isUuid(i.id)).map((i) => i.id));
  const toDelete = (existing ?? [])
    .map((r) => String(r.id))
    .filter((id) => !payloadIds.has(id));

  if (toDelete.length) {
    await supabase.from("advisor_services").delete().eq("advisor_id", advisorId).in("id", toDelete);
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
      key_services: item.roleLabel || null,
      short_summary: item.statusMessage || null,
      company_logo_url: item.companyLogoUrl || null,
    };

    if (isUuid(item.id)) {
      await supabase.from("advisor_services").update(row).eq("id", item.id).eq("advisor_id", advisorId);
    } else {
      await supabase.from("advisor_services").insert(row);
    }
  }

  const { data } = await supabase
    .from("advisor_services")
    .select("*")
    .eq("advisor_id", advisorId)
    .order("created_at", { ascending: false });

  return normalizeServices(mapDbServices((data ?? []) as Record<string, unknown>[]));
}

export async function syncAchievements(advisorId: string, items: AchievementItem[]) {
  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("advisor_achievements")
    .select("id")
    .eq("advisor_id", advisorId);

  const payloadIds = new Set(items.filter((i) => isUuid(i.id)).map((i) => i.id));
  const toDelete = (existing ?? [])
    .map((r) => String(r.id))
    .filter((id) => !payloadIds.has(id));

  if (toDelete.length) {
    await supabase
      .from("advisor_achievements")
      .delete()
      .eq("advisor_id", advisorId)
      .in("id", toDelete);
  }

  for (const item of items) {
    const row = {
      advisor_id: advisorId,
      title: item.title,
      organisation: item.subtitle || "—",
      description: item.description,
      achievement_year: item.years[0] || String(new Date().getFullYear()),
      type: ACHIEVEMENT_TYPE[item.category] ?? "other",
      icon: item.iconStyle,
    };

    if (isUuid(item.id)) {
      await supabase
        .from("advisor_achievements")
        .update(row)
        .eq("id", item.id)
        .eq("advisor_id", advisorId);
    } else {
      await supabase.from("advisor_achievements").insert(row);
    }
  }

  const { data } = await supabase
    .from("advisor_achievements")
    .select("*")
    .eq("advisor_id", advisorId)
    .order("created_at", { ascending: false });

  return normalizeAchievements(
    mapDbAchievements((data ?? []) as Record<string, unknown>[]),
  );
}

export async function syncGallery(advisorId: string, items: GalleryItem[]) {
  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("advisor_gallery")
    .select("id")
    .eq("advisor_id", advisorId);

  const payloadIds = new Set(items.filter((i) => isUuid(i.id)).map((i) => i.id));
  const toDelete = (existing ?? [])
    .map((r) => String(r.id))
    .filter((id) => !payloadIds.has(id));

  if (toDelete.length) {
    await supabase.from("advisor_gallery").delete().eq("advisor_id", advisorId).in("id", toDelete);
  }

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const caption = [item.title, item.caption].filter(Boolean).join("\n").trim() || item.title;
    const row = {
      advisor_id: advisorId,
      image_url: item.imageUrl,
      caption,
      category: item.category,
      sort_order: index,
    };

    if (isUuid(item.id)) {
      await supabase.from("advisor_gallery").update(row).eq("id", item.id).eq("advisor_id", advisorId);
    } else if (item.imageUrl) {
      await supabase.from("advisor_gallery").insert(row);
    }
  }

  const { data } = await supabase
    .from("advisor_gallery")
    .select("*")
    .eq("advisor_id", advisorId)
    .order("created_at", { ascending: false });

  return mapDbGallery((data ?? []) as Record<string, unknown>[]);
}

export async function syncTestimonials(advisorId: string, items: TestimonialItem[]) {
  const supabase = createAdminClient();
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

    const row = {
      advisor_id: advisorId,
      name: item.name,
      mobile_number: "0000000000",
      testimonial_type: item.type,
      content: item.quote,
      media_url: item.mediaUrl ?? null,
      testimonial_rating: item.rating,
      status: "approved",
      is_mobile_verified: true,
    };

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

  const { data } = await supabase
    .from("advisor_testimonials")
    .select("*")
    .eq("advisor_id", advisorId)
    .order("created_at", { ascending: false });

  return normalizeTestimonials(
    mapDbTestimonials((data ?? []) as Record<string, unknown>[]),
  );
}

import { normalizeOptionalVerification } from "@/lib/verification/defaults";
import { parseGoldMeta } from "@/lib/server/supabase/gold-meta";
import type { AchievementItem, ServiceItem, TestimonialItem } from "@/lib/sections/types";
import type { GalleryCategory, GalleryItem } from "@/lib/gallery-types";
import type { Lead } from "@/lib/leads/types";
import {
  parseKeyServices,
  parseServiceGoldMeta,
} from "@/lib/advisor/service-item-meta";
import type { ServiceCapacityId } from "@/lib/advisor/serviceCapacity";

const SERVICE_CATEGORY: Record<string, ServiceItem["category"]> = {
  "life insurance": "life",
  life: "life",
  "health insurance": "health",
  health: "health",
  "mutual funds": "mutual",
  mutual: "mutual",
};

function serviceCategory(raw: string | null | undefined): ServiceItem["category"] {
  const key = String(raw || "").trim().toLowerCase();
  return SERVICE_CATEGORY[key] ?? "general";
}

export function mapDbServices(rows: Record<string, unknown>[]): ServiceItem[] {
  return rows.map((row) => {
    const clients = Number(row.no_of_clients ?? 0) || 0;
    const claims = Number(row.number_of_climes ?? 0) || 0;
    const years = row.experience_years != null ? Number(row.experience_years) : null;
    const rawSummary = String(row.short_summary || "");
    const { text: statusMessage, meta } = parseGoldMeta(rawSummary);
    const { roleLabel, capacityId: capacityFromTags } = parseKeyServices(row.key_services);
    const parsed = parseServiceGoldMeta(meta, capacityFromTags);

    return {
      id: String(row.id),
      category: serviceCategory(row.service_type as string),
      title: String(row.service_type || "Insurance service"),
      provider: String(row.company || ""),
      experience: years ? `${years}+ Years` : "",
      serviceStartDate: typeof row.from_year === "string" ? row.from_year : undefined,
      roleLabel,
      clients,
      claims,
      sumInsured: parsed.sumInsured ?? "—",
      statusMessage,
      statusCaption: "",
      areas: Array.isArray(meta.areas) ? (meta.areas as import("@/lib/sections/types").ServiceArea[]) : [],
      verified: true,
      verification: { status: "verified" as const, documents: [], updatedAt: new Date().toISOString() },
      companyLogoUrl: typeof row.company_logo_url === "string" ? row.company_logo_url : undefined,
      licenseHolder: parsed.licenseHolder,
      capacityId: parsed.capacityId as ServiceCapacityId,
      cardDisplay: parsed.cardDisplay,
      teamSize: parsed.teamSize,
      activeAgents: parsed.activeAgents,
      branchCount: parsed.branchCount,
      claimSettled: parsed.claimSettled ?? "—",
      claimRatio: parsed.claimRatio ?? 0,
      showDetailCard: true,
    };
  });
}

function mapDbTestimonialRow(row: Record<string, unknown>): TestimonialItem {
  const rawContent = String(row.content || "");
  const { text: quote, meta } = parseGoldMeta(rawContent);
  const mobile = String(row.mobile_number || "");
  const isAdvisorSeeded = mobile === "0000000000";
  const dbStatus = String(row.status || "pending");
  const status: TestimonialItem["status"] =
    dbStatus === "approved" ? "published" : dbStatus === "draft" ? "draft" : "published";

  const source =
    (meta.source as TestimonialItem["source"]) ?? (isAdvisorSeeded ? "advisor" : "customer");

  return {
    id: String(row.id),
    source,
    type: (row.testimonial_type as TestimonialItem["type"]) || "text",
    name: String(row.name || "Client"),
    quote,
    rating: Number(row.testimonial_rating ?? row.rating ?? 5) || 5,
    service: (meta.service as TestimonialItem["service"]) || "general",
    profession: String(meta.profession ?? ""),
    location: String(meta.location ?? ""),
    date: row.created_at
      ? new Date(String(row.created_at)).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        })
      : "",
    submittedAt: (meta.submittedAt as string) ?? (row.created_at ? String(row.created_at) : undefined),
    status,
    memberBadge: row.is_mobile_verified ? "mobile-verified" : "yvity-member",
    verified: Boolean(row.is_verified ?? row.is_mobile_verified),
    mediaUrl: typeof row.media_url === "string" ? row.media_url : undefined,
    audioDuration: meta.audioDuration as string | undefined,
    videoDuration: meta.videoDuration as string | undefined,
    advisorReply: row.reply_text
      ? {
          text: String(row.reply_text),
          repliedOn: String(row.reply_created_at || row.updated_at || ""),
        }
      : undefined,
  };
}

export function mapDbTestimonials(rows: Record<string, unknown>[]): TestimonialItem[] {
  return rows.map(mapDbTestimonialRow);
}

export function mapDbTestimonialsPublic(rows: Record<string, unknown>[]): TestimonialItem[] {
  return rows
    .filter((row) => String(row.status || "approved") === "approved")
    .map(mapDbTestimonialRow);
}

const ACHIEVEMENT_CATEGORY: Record<string, AchievementItem["category"]> = {
  life: "life",
  health: "health",
  education: "education",
  other: "other",
};

export function mapDbAchievements(rows: Record<string, unknown>[]): AchievementItem[] {
  return rows.map((row) => {
    const typeKey = String(row.type || "other").toLowerCase();
    const rawDesc = String(row.description || "");
    const { text: description, meta } = parseGoldMeta(rawDesc);
    const verification = normalizeOptionalVerification(meta.verification);
    const metaYears = Array.isArray(meta.years)
      ? (meta.years as unknown[]).map(String).filter(Boolean)
      : null;
    const baseYear = row.achievement_year ? [String(row.achievement_year)] : [];
    const years = metaYears ?? baseYear;
    const achievedCount =
      typeof meta.achievedCount === "number" && meta.achievedCount > 1
        ? meta.achievedCount
        : Math.max(1, years.length);
    return {
      id: String(row.id),
      category: ACHIEVEMENT_CATEGORY[typeKey] ?? "other",
      title: String(row.title || "Achievement"),
      subtitle: String(row.organisation || ""),
      description,
      achievedCount,
      years,
      iconStyle: (String(row.icon || "trophy") as AchievementItem["iconStyle"]) || "trophy",
      verified: verification?.status === "verified",
      verification,
    };
  });
}

const GALLERY_CATEGORY: Record<string, GalleryCategory> = {
  milestones: "milestones",
  milestone: "milestones",
  events: "events",
  event: "events",
  team: "team",
  awards: "awards",
  award: "awards",
  speaking: "speaking",
  general: "milestones",
};

function galleryCategory(raw: string | null | undefined): GalleryCategory {
  const key = String(raw || "").trim().toLowerCase();
  if (key in GALLERY_CATEGORY) return GALLERY_CATEGORY[key];
  if (key.includes("award")) return "awards";
  if (key.includes("event")) return "events";
  if (key.includes("team")) return "team";
  if (key.includes("speak") || key.includes("panel") || key.includes("talk")) return "speaking";
  if (
    key.includes("milestone") ||
    key.includes("certificate") ||
    key.includes("achievement")
  ) {
    return "milestones";
  }
  return "events";
}

function formatGalleryDate(createdAt: unknown): string {
  if (!createdAt) return "";
  const d = new Date(String(createdAt));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function mapDbGallery(rows: Record<string, unknown>[]): GalleryItem[] {
  return rows.map((row) => {
    const raw = String(row.caption || "").trim();
    // New format: "title\n\ncaption" (double newline separator written by syncGallery).
    // Legacy format: "title\ncaption" (single newline, older rows).
    let title: string;
    let caption: string;
    if (raw.includes("\n\n")) {
      const sep = raw.indexOf("\n\n");
      title = raw.slice(0, sep).trim() || "Gallery moment";
      caption = raw.slice(sep + 2).trim() || title;
    } else {
      title = raw.split("\n")[0]?.slice(0, 120) || "Gallery moment";
      caption = raw || title;
    }

    const validLayouts = ["hero", "wide", "tall", "default"] as const;
    const rawLayout = String(row.layout ?? "default");
    const layout = (validLayouts as readonly string[]).includes(rawLayout)
      ? (rawLayout as import("@/lib/gallery-types").GalleryLayout)
      : "default";

    return {
      id: String(row.id),
      title,
      caption,
      category: galleryCategory(row.category as string),
      date: formatGalleryDate(row.created_at),
      imageUrl: String(row.image_url || row.url || ""),
      featured: Boolean(row.is_featured ?? row.sort_order === 0),
      location: row.location ? String(row.location) : undefined,
      layout,
    };
  });
}

function readGoldMeta(row: Record<string, unknown>): Record<string, unknown> {
  const meta = row.gold_meta;
  return meta && typeof meta === "object" ? (meta as Record<string, unknown>) : {};
}

export function mapDbProspectsToLeads(rows: Record<string, unknown>[]): Lead[] {
  return rows.map((row) => {
    const meta = readGoldMeta(row);
    return {
      id: String(row.id),
      origin: (meta.origin as Lead["origin"]) || "yvity",
      channel: (meta.channel as Lead["channel"]) || "yvity_public_profile",
      fullName: String(row.name || ""),
      mobile: String(row.phone_number || ""),
      city: String(meta.city || ""),
      serviceType: (meta.serviceType as Lead["serviceType"]) || "general",
      priority: (meta.priority as Lead["priority"]) || "medium",
      status: (meta.status as Lead["status"]) || "new",
      notes: String(meta.notes ?? row.note ?? ""),
      followUpType: meta.followUpType as Lead["followUpType"],
      followUpDate: meta.followUpDate as string | undefined,
      followUpTime: meta.followUpTime as string | undefined,
      lastActivityAt: meta.lastActivityAt as string | undefined,
      convertedAt: meta.convertedAt as string | undefined,
      message: meta.message as string | undefined,
      sourceInquiryId: meta.sourceInquiryId as string | undefined,
      createdAt: String(row.created_at || new Date().toISOString()),
      updatedAt: String(row.updated_at || row.created_at || new Date().toISOString()),
    };
  });
}

export function mapLeadPatchToProspect(
  patch: Record<string, unknown>,
): { columns: Record<string, unknown>; goldMeta: Record<string, unknown> } {
  const columns: Record<string, unknown> = {};
  const goldMeta: Record<string, unknown> = {};

  if (patch.fullName != null) columns.name = String(patch.fullName);
  if (patch.mobile != null) columns.phone_number = String(patch.mobile);
  if (patch.notes != null) columns.note = String(patch.notes);

  const metaKeys = [
    "origin",
    "channel",
    "city",
    "serviceType",
    "priority",
    "status",
    "notes",
    "followUpType",
    "followUpDate",
    "followUpTime",
    "lastActivityAt",
    "convertedAt",
    "message",
    "sourceInquiryId",
  ] as const;

  for (const key of metaKeys) {
    if (patch[key] !== undefined) goldMeta[key] = patch[key];
  }

  if (patch.notes !== undefined) goldMeta.notes = patch.notes;

  return { columns, goldMeta };
}

export function mapLeadToProspectRow(advisorId: string, lead: Lead): Record<string, unknown> {
  return {
    id: /^[0-9a-f-]{36}$/i.test(lead.id) ? lead.id : undefined,
    advisor_id: advisorId,
    name: lead.fullName,
    phone_number: lead.mobile,
    note: lead.notes || null,
    gold_meta: {
      origin: lead.origin,
      channel: lead.channel,
      city: lead.city ?? "",
      serviceType: lead.serviceType,
      priority: lead.priority,
      status: lead.status,
      notes: lead.notes,
      followUpType: lead.followUpType,
      followUpDate: lead.followUpDate,
      followUpTime: lead.followUpTime,
      lastActivityAt: lead.lastActivityAt,
      convertedAt: lead.convertedAt,
      message: lead.message,
      sourceInquiryId: lead.sourceInquiryId,
    },
    created_at: lead.createdAt,
    updated_at: lead.updatedAt,
  };
}

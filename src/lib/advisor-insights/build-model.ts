import { advisorProfile } from "@/lib/advisor-profile";
import {
  buildProfileHealth,
  profileCompletionPercent,
  profileStrengthLabel,
} from "@/lib/advisor-dashboard/build-model";
import { getYvityScoreTotal } from "@/lib/advisor-score/build";
import { getEmptyAnalytics } from "@/lib/advisor-dashboard/demo-analytics";
import { computeOverviewStats } from "@/lib/leads/utils";
import { normalizeLeadServiceType } from "@/lib/leads/service-types";
import type { Lead } from "@/lib/leads/types";
import type { CareerData } from "@/lib/career-types";
import type { AchievementItem, ServiceItem, TestimonialItem } from "@/lib/sections/types";
import type { GalleryItem } from "@/lib/gallery-types";
import { getEmptyInsightsMetrics, INSIGHTS_SERVICE_IDS } from "./demo-metrics";
import type { CredibilitySuggestion, InsightsModel, LeadSourceInsight } from "./types";

function countLeadsBySource(leads: Lead[]): LeadSourceInsight[] {
  const buckets = {
    yvity_public_profile: {
      id: "yvity_public_profile" as const,
      label: "Public Profile",
      count: 0,
    },
    self_referral: { id: "self_referral" as const, label: "Referral", count: 0 },
    self_manual: { id: "self_manual" as const, label: "Manual Entry", count: 0 },
  };

  for (const lead of leads) {
    if (lead.channel === "yvity_public_profile") buckets.yvity_public_profile.count += 1;
    else if (lead.channel === "self_referral") buckets.self_referral.count += 1;
    else if (lead.channel === "self_manual") buckets.self_manual.count += 1;
  }

  const total = leads.length || 1;
  return Object.values(buckets).map((b) => ({
    ...b,
    percent: leads.length === 0 ? 0 : Math.round((b.count / total) * 100),
  }));
}

function countLeadsByService(leads: Lead[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const lead of leads) {
    const id = normalizeLeadServiceType(lead.serviceType);
    map.set(id, (map.get(id) ?? 0) + 1);
  }
  return map;
}

function buildCredibilitySuggestions(
  healthItems: ReturnType<typeof buildProfileHealth>,
): CredibilitySuggestion[] {
  const copy: Record<string, { title: string; description: string }> = {
    "intro-video": {
      title: "Upload Introduction Video",
      description: "A short intro builds trust before the first conversation.",
    },
    testimonials: {
      title: "Add More Testimonials",
      description: "Client stories improve conversion from profile visitors.",
    },
    achievements: {
      title: "Add Achievement",
      description: "Show awards and milestones that strengthen credibility.",
    },
    education: {
      title: "Complete Educational Journey",
      description: "Add degrees and certifications to your career profile.",
    },
    services: {
      title: "Add Service Information",
      description: "List the insurance and advisory services you offer.",
    },
    career: {
      title: "Complete Career Journey",
      description: "Share experience highlights advisors look for first.",
    },
    gallery: {
      title: "Upload Gallery Photos",
      description: "Add professional photos to humanize your profile.",
    },
  };

  return healthItems
    .filter((i) => !i.complete)
    .map((item) => ({
      id: item.id,
      title: copy[item.id]?.title ?? `Complete ${item.label}`,
      description: copy[item.id]?.description ?? `Improve your YVITY profile strength.`,
      profileSection: item.profileSection,
    }))
    .slice(0, 5);
}

function testimonialsThisMonth(items: TestimonialItem[]): number {
  const now = new Date();
  const month = now.toLocaleString("en-US", { month: "short" }).toLowerCase();
  const year = String(now.getFullYear());
  return items.filter((t) => {
    const d = t.date.toLowerCase();
    return d.includes(month) && d.includes(year);
  }).length;
}

function averageRating(items: TestimonialItem[]): number {
  if (items.length === 0) return 0;
  const sum = items.reduce((s, t) => s + (t.rating ?? 0), 0);
  return Math.round((sum / items.length) * 10) / 10;
}

export function buildInsightsModel(input: {
  career: CareerData;
  services: ServiceItem[];
  achievements: AchievementItem[];
  testimonials: TestimonialItem[];
  gallery: GalleryItem[];
  leads: Lead[];
  /**
   * Effective intro video URL — usually `getEffectiveIntroVideoUrl(settings)`.
   * Falls back to the static `advisorProfile.home.introVideoUrl` seed.
   */
  introVideoUrl?: string;
  photoUrl?: string;
  publicProfileActive?: boolean;
  underReview?: boolean;
}): InsightsModel {
  const demo = getEmptyAnalytics();
  const metrics = getEmptyInsightsMetrics();

  const profilePhotoUrl = input.photoUrl?.trim() || advisorProfile.photoUrl?.trim() || "";
  const healthItems = buildProfileHealth({
    photoUrl: profilePhotoUrl,
    introVideoUrl: input.introVideoUrl ?? advisorProfile.home.introVideoUrl,
    career: input.career,
    services: input.services,
    achievements: input.achievements,
    testimonials: input.testimonials,
    gallery: input.gallery,
  });
  const completionPercent = profileCompletionPercent(healthItems);
  const profileStrength = profileStrengthLabel(completionPercent);
  const yvityScore = getYvityScoreTotal({
    photoUrl: profilePhotoUrl,
    introVideoUrl: input.introVideoUrl ?? advisorProfile.home.introVideoUrl,
    publicProfileActive: input.publicProfileActive ?? false,
    career: input.career,
    services: input.services,
    achievements: input.achievements,
    testimonials: input.testimonials,
    gallery: input.gallery,
    underReview: input.underReview,
  });

  const leadStats = computeOverviewStats(input.leads);
  const platformLeads = input.leads.filter((l) => l.channel === "yvity_public_profile").length;
  const contactRequests = platformLeads;

  const leadsByService = countLeadsByService(input.leads);
  const servicePerformance = INSIGHTS_SERVICE_IDS.map((s) => ({
    id: s.id,
    label: s.label,
    views: metrics.serviceViews(s.id),
    leads: leadsByService.get(s.id) ?? 0,
  })).sort((a, b) => b.leads - a.leads || b.views - a.views);

  const conversionRate =
    input.leads.length === 0 ? 0 : Math.round((leadStats.converted / input.leads.length) * 100);

  return {
    profilePerformance: {
      totalProfileViews: demo.profileViews,
      monthProfileViews: metrics.monthProfileViews,
      monthViewsDelta: metrics.monthViewsDelta,
      searchAppearances: demo.searchAppearances,
      searchDelta: demo.searchDelta,
      profileShares: metrics.profileShares,
      sharesDelta: metrics.sharesDelta,
      contactRequests,
      contactDelta: metrics.contactDelta,
    },
    leadInsights: {
      totalLeads: leadStats.total,
      newLeads: leadStats.new,
      convertedLeads: leadStats.converted,
      conversionRate,
      bySource: countLeadsBySource(input.leads),
    },
    servicePerformance,
    credibility: {
      yvityScore,
      scoreTrend: metrics.scoreTrend,
      completionPercent,
      profileStrength,
      suggestions: buildCredibilitySuggestions(healthItems),
    },
    testimonialInsights: {
      total: input.testimonials.length,
      averageRating: averageRating(input.testimonials),
      newThisMonth: testimonialsThisMonth(input.testimonials),
    },
  };
}

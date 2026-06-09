import { getEmptyAnalytics } from "@/lib/advisor-dashboard/demo-analytics";
import { getEmptyInsightsMetrics } from "@/lib/advisor-insights/demo-metrics";
import type { CareerData } from "@/lib/career-types";
import { formatMdrtStatusLabel, hasMdrtAchievement } from "@/lib/sections/achievement-tiers";
import { normalizeCompanyName } from "@/lib/sections/service-display";
import type { AchievementItem, ServiceItem, TestimonialItem } from "@/lib/sections/types";
import { isServiceVisibleOnPublicProfile } from "@/lib/verification/defaults";
import type { ProfileHeroStat } from "@/lib/advisor/profile-hero-stat";
import type { CommunityTrustStat } from "@/lib/home/community-trust-stats";

export type PublicProfileBannerStats = {
  experienceDisplay: string;
  /** @deprecated Use profileHeroStat.value */
  clientsCount: string;
  profileHeroStat: ProfileHeroStat;
  companyName: string;
  avgRating: number | null;
  avgRatingLabel: string;
  testimonialCount: number;
  recommendationCount: number;
  achievementCount: number;
  mdrtLabel: string;
  mdrtMember: boolean;
  irdaiVerified: boolean;
  profileApproved: boolean;
  sectionBannerStats: { value: string; label: string }[];
  communityTrustStats: CommunityTrustStat[];
  highlightLabels: { label: string }[];
};

function parseAverageRating(testimonials: TestimonialItem[]): number | null {
  if (testimonials.length === 0) return null;
  const total = testimonials.reduce((sum, item) => sum + item.rating, 0);
  const avg = total / testimonials.length;
  return Number.isFinite(avg) ? Number(avg.toFixed(1)) : null;
}

export function resolvePrimaryCompanyName(
  services: ServiceItem[],
  profileApproved: boolean,
): string {
  const visible = services.filter((item) =>
    isServiceVisibleOnPublicProfile(item, profileApproved),
  );

  for (const service of visible) {
    const company = normalizeCompanyName(service.provider);
    if (company) return company;
  }

  return "";
}

export function isIrdaiVerified(profileApproved: boolean): boolean {
  return profileApproved;
}

export function buildSectionProfileBannerStats(input: {
  experienceDisplay: string;
  avgRating: number | null;
  companyName: string;
  profileApproved: boolean;
}): { value: string; label: string }[] {
  const experienceValue = input.experienceDisplay
    ? input.experienceDisplay.includes("year") || input.experienceDisplay.endsWith("+")
      ? input.experienceDisplay
      : `${input.experienceDisplay} yrs`
    : "—";

  return [
    { value: experienceValue, label: "Years experience" },
    {
      value: input.avgRating != null ? `${input.avgRating}/5` : "—",
      label: "Rating",
    },
    { value: input.companyName || "—", label: "Company" },
    {
      value: input.profileApproved ? "Verified" : "—",
      label: "YVITY verified",
    },
  ];
}

export function buildCommunityTrustStatsFromCounts(input: {
  testimonialCount: number;
  recommendationCount: number;
  profileApproved: boolean;
  /** Optional real monthly profile views for this advisor. */
  profileViews?: number;
  /** Optional real monthly unique client sharers for this advisor. */
  clientSharers?: number;
  /** Optional preformatted month-over-month deltas. */
  profileViewsDelta?: string;
  sharesDelta?: string;
}): CommunityTrustStat[] {
  const demo = getEmptyAnalytics();
  const metrics = getEmptyInsightsMetrics();

  const profileViews =
    typeof input.profileViews === "number" ? Math.max(0, input.profileViews) : null;
  const clientSharers =
    typeof input.clientSharers === "number" ? Math.max(0, input.clientSharers) : null;

  return [
    {
      id: "profileViews",
      label: "Profile Views",
      value:
        profileViews != null
          ? profileViews
          : input.profileApproved
            ? demo.profileViews
            : 0,
      trend:
        profileViews != null
          ? input.profileViewsDelta
          : input.profileApproved
            ? demo.profileViewsDelta
            : undefined,
    },
    {
      id: "recommendations",
      label: "Recommendations",
      value: input.recommendationCount,
      trend:
        input.recommendationCount > 0
          ? `${input.recommendationCount} verified`
          : input.profileApproved
            ? demo.recommendationGrowth
            : undefined,
    },
    {
      id: "testimonials",
      label: "Testimonials",
      value: input.testimonialCount,
      trend:
        input.testimonialCount > 0
          ? `${input.testimonialCount} received`
          : input.profileApproved
            ? demo.testimonialGrowth
            : undefined,
    },
    {
      id: "profileShares",
      label: "Profile Shares",
      value:
        clientSharers != null
          ? clientSharers
          : input.profileApproved
            ? metrics.profileShares
            : 0,
      trend:
        clientSharers != null
          ? input.sharesDelta
          : input.profileApproved
            ? metrics.sharesDelta
            : undefined,
    },
  ];
}

export function buildAdvisorHighlightLabels(input: {
  experienceDisplay: string;
  profileHeroStat: ProfileHeroStat;
  phone: string;
  profileApproved: boolean;
}): { label: string }[] {
  const highlights: { label: string }[] = [];

  if (input.experienceDisplay) {
    highlights.push({ label: `${input.experienceDisplay} experience` });
  }
  if (input.profileHeroStat.value !== "—" && input.profileHeroStat.highlightLabel) {
    highlights.push({ label: input.profileHeroStat.highlightLabel });
  }
  if (input.phone && !input.phone.startsWith("Add")) {
    highlights.push({ label: "Direct advisor contact" });
  }

  if (highlights.length === 0) {
    return [
      { label: "Verified credentials" },
      { label: "Flexible consultation" },
      { label: "Direct advisor contact" },
    ];
  }

  while (highlights.length < 3) {
    highlights.push({
      label: input.profileApproved ? "Verified by YVITY" : "Flexible consultation",
    });
  }

  return highlights.slice(0, 3);
}

/** Derives all banner / pill stats for the public profile from saved advisor data. */
export function buildPublicProfileBannerStats(input: {
  services: ServiceItem[];
  testimonials: TestimonialItem[];
  achievements: AchievementItem[];
  career: CareerData;
  profileApproved: boolean;
  experienceDisplay: string;
  profileHeroStat: ProfileHeroStat;
  recommendationCount: number;
  phone: string;
}): PublicProfileBannerStats {
  const avgRating = parseAverageRating(input.testimonials);
  const companyName = resolvePrimaryCompanyName(input.services, input.profileApproved);
  const mdrtLabel = formatMdrtStatusLabel(input.achievements);
  const mdrtMember = hasMdrtAchievement(input.achievements);

  return {
    experienceDisplay: input.experienceDisplay,
    clientsCount: input.profileHeroStat.value,
    profileHeroStat: input.profileHeroStat,
    companyName,
    avgRating,
    avgRatingLabel: avgRating != null ? String(avgRating) : "—",
    testimonialCount: input.testimonials.length,
    recommendationCount: input.recommendationCount,
    achievementCount: input.achievements.length,
    mdrtLabel,
    mdrtMember,
    irdaiVerified: isIrdaiVerified(input.profileApproved),
    profileApproved: input.profileApproved,
    sectionBannerStats: buildSectionProfileBannerStats({
      experienceDisplay: input.experienceDisplay,
      avgRating,
      companyName,
      profileApproved: input.profileApproved,
    }),
    communityTrustStats: buildCommunityTrustStatsFromCounts({
      testimonialCount: input.testimonials.length,
      recommendationCount: input.recommendationCount,
      profileApproved: input.profileApproved,
    }),
    highlightLabels: buildAdvisorHighlightLabels({
      experienceDisplay: input.experienceDisplay,
      profileHeroStat: input.profileHeroStat,
      phone: input.phone,
      profileApproved: input.profileApproved,
    }),
  };
}

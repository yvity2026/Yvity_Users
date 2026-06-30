import type { CareerData } from "@/lib/career-types";
import { computeCareerTotalExperienceYears } from "@/lib/advisor/profession-experience";
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
  /** Stats for the career section banner — experience and orgs from career entries only. */
  careerSectionBannerStats: { value: string; label: string }[];
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

/** Career-page-specific banner stats — experience and orgs from career entries only. */
export function buildCareerSectionBannerStats(
  career: CareerData,
  avgRating: number | null,
): { value: string; label: string }[] {
  const years = computeCareerTotalExperienceYears(career);
  const experienceValue =
    years === null ? "—" : years === 0 ? "< 1 yr" : `${years}+ yrs`;

  const orgSet = new Set(
    career.experiences.map((e) => e.company.trim().toLowerCase()).filter(Boolean),
  );
  const orgCount = orgSet.size;
  const orgValue = orgCount > 0 ? String(orgCount) : "—";
  const orgLabel = orgCount === 1 ? "Organisation" : "Organisations";

  return [
    { value: experienceValue, label: "Years experience" },
    { value: avgRating != null ? `${avgRating}/5` : "—", label: "Rating" },
    { value: orgValue, label: orgLabel },
  ];
}

export function buildSectionProfileBannerStats(input: {
  /** Total career experience — from journey entries, not current profession. */
  experienceDisplay: string;
  avgRating: number | null;
  organizationCount: number;
}): { value: string; label: string }[] {
  const experienceValue = input.experienceDisplay
    ? input.experienceDisplay.includes("year") || input.experienceDisplay.endsWith("+")
      ? input.experienceDisplay
      : `${input.experienceDisplay} yrs`
    : "—";

  const orgValue = input.organizationCount > 0 ? String(input.organizationCount) : "—";
  const orgLabel = input.organizationCount === 1 ? "Organisation" : "Organisations";

  return [
    { value: experienceValue, label: "Years experience" },
    {
      value: input.avgRating != null ? `${input.avgRating}/5` : "—",
      label: "Rating",
    },
    { value: orgValue, label: orgLabel },
  ];
}

/** Hide flat month-over-month deltas (e.g. `0%`) — only show meaningful movement. */
function meaningfulMonthDelta(delta?: string): string | undefined {
  const trimmed = delta?.trim();
  if (!trimmed || trimmed === "0%" || trimmed === "0") return undefined;
  return trimmed;
}

export function buildCommunityTrustStatsFromCounts(input: {
  testimonialCount: number;
  recommendationCount: number;
  profileApproved: boolean;
  profileViews?: number;
  clientSharers?: number;
  profileViewsDelta?: string;
  sharesDelta?: string;
}): CommunityTrustStat[] {
  const profileViews =
    typeof input.profileViews === "number" ? Math.max(0, input.profileViews) : 0;
  const clientSharers =
    typeof input.clientSharers === "number" ? Math.max(0, input.clientSharers) : 0;

  const recommendationTrend =
    input.recommendationCount > 0
      ? `${input.recommendationCount} verified`
      : undefined;
  const testimonialTrend =
    input.testimonialCount > 0 ? `${input.testimonialCount} received` : undefined;

  return [
    {
      id: "profileViews",
      label: "Profile Views",
      value: profileViews,
      trend: input.profileViewsDelta?.trim() || undefined,
    },
    {
      id: "recommendations",
      label: "Recommendations",
      value: input.recommendationCount,
      trend: recommendationTrend,
    },
    {
      id: "testimonials",
      label: "Testimonials",
      value: input.testimonialCount,
      trend: testimonialTrend,
    },
    {
      id: "profileShares",
      label: "Profile Shares",
      value: clientSharers,
      trend: meaningfulMonthDelta(input.sharesDelta),
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

  const padLabels = input.profileApproved
    ? ["Verified by YVITY", "Flexible consultation", "Direct advisor contact"]
    : ["Flexible consultation", "Verified credentials", "Direct advisor contact"];
  for (const label of padLabels) {
    if (highlights.length >= 3) break;
    if (!highlights.some((h) => h.label === label)) {
      highlights.push({ label });
    }
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
  journeyExperienceDisplay: string;
  profileHeroStat: ProfileHeroStat;
  recommendationCount: number;
  phone: string;
}): PublicProfileBannerStats {
  const avgRating = parseAverageRating(input.testimonials);
  const companyName = resolvePrimaryCompanyName(input.services, input.profileApproved);
  const mdrtLabel = formatMdrtStatusLabel(input.achievements);
  const mdrtMember = hasMdrtAchievement(input.achievements);
  const visibleServices = input.services.filter((s) =>
    isServiceVisibleOnPublicProfile(s, input.profileApproved),
  );
  const organizationCount = new Set([
    ...input.career.experiences.map((e) => e.company.trim().toLowerCase()).filter(Boolean),
    ...visibleServices.map((s) => normalizeCompanyName(s.provider).trim().toLowerCase()).filter(Boolean),
  ]).size;

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
      experienceDisplay: input.journeyExperienceDisplay || input.experienceDisplay,
      avgRating,
      organizationCount,
    }),
    careerSectionBannerStats: buildCareerSectionBannerStats(input.career, avgRating),
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

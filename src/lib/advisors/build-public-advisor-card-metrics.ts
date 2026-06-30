import "server-only";

import {
  computeProfessionExperienceYears,
} from "@/lib/advisor/profession-experience";
import { resolveProfileHeroStat } from "@/lib/advisor/profile-hero-stat";
import { getYvityScoreTotal } from "@/lib/advisor-score/build";
import { resolvePlanLimits } from "@/lib/advisor-membership/plan-limits";
import { getPlanGatedIntroVideoUrl } from "@/lib/intro-video";
import { loadCareerForUser } from "@/lib/server/career-persistence";
import { loadAdvisorSettings } from "@/lib/server/advisor-settings-persistence";
import { countVerifiedRecommendations } from "@/lib/server/recommendations-persistence";
import {
  loadAchievementsForUser,
  loadGalleryForUser,
  loadServicesForUser,
} from "@/lib/server/section-persistence";
import { loadTestimonials } from "@/lib/server/testimonials-persistence";
import { extractAchievementTags } from "@/lib/sections/achievement-tiers";
import { averageTestimonialRating } from "@/lib/sections/normalize-testimonials";
import { normalizeCompanyName } from "@/lib/sections/service-display";
import { categoryHeadingFor } from "@/lib/sections/services-config";
import { isServiceVisibleOnPublicProfile } from "@/lib/verification/defaults";

export type PublicAdvisorCardMetrics = {
  score: number;
  exp: string;
  clients: string;
  clientsLabel: string;
  recs: string;
  reviews: string;
  avgRating: string;
  serviceTypes: string[];
  achievementTags: string[];
  companies: string[];
};

type LoadMetricsInput = {
  userId: string;
  photoUrl?: string | null;
  profileApproved: boolean;
  underReview: boolean;
  publicProfileActive: boolean;
  subscriptionPlan?: unknown;
  accountStatus?: unknown;
};

/** Loads per-advisor JSON sections and derives public card metrics. */
export async function loadPublicAdvisorCardMetrics(
  input: LoadMetricsInput,
): Promise<PublicAdvisorCardMetrics> {
  const { userId, photoUrl, profileApproved, underReview, publicProfileActive } = input;

  const [services, achievements, testimonials, gallery, settings, career, verifiedRecs] =
    await Promise.all([
      loadServicesForUser(userId),
      loadAchievementsForUser(userId),
      loadTestimonials(userId),
      loadGalleryForUser(userId),
      loadAdvisorSettings(userId),
      loadCareerForUser(userId),
      countVerifiedRecommendations(userId),
    ]);
  const limits = resolvePlanLimits(input.subscriptionPlan, input.accountStatus);

  const visibleServices = services.filter((item) =>
    isServiceVisibleOnPublicProfile(item, profileApproved),
  );

  const experienceYears = computeProfessionExperienceYears(services, profileApproved);
  const profileHeroStat = resolveProfileHeroStat(services, profileApproved);

  const serviceTypes = visibleServices
    .map((item) => categoryHeadingFor(item.category))
    .filter(Boolean)
    .slice(0, 3);

  const companies = [
    ...new Set(
      visibleServices
        .map((item) => normalizeCompanyName(item.provider))
        .filter(Boolean),
    ),
  ];

  const achievementTags = extractAchievementTags(achievements);

  const score = getYvityScoreTotal({
    photoUrl: photoUrl?.trim() || undefined,
    introVideoUrl: getPlanGatedIntroVideoUrl(settings, limits),
    publicProfileActive,
    profileApproved,
    career,
    services,
    achievements,
    testimonials,
    gallery,
    underReview,
    verifiedRecommendationCount: underReview ? 0 : verifiedRecs,
  });

  const recCount = underReview ? 0 : verifiedRecs;
  const avgRating = averageTestimonialRating(testimonials);

  return {
    score: Math.max(0, Math.min(100, score)),
    exp: experienceYears !== null ? String(experienceYears) : "0",
    clients: profileHeroStat.value === "—" ? "0" : profileHeroStat.value,
    clientsLabel: profileHeroStat.label,
    recs: String(recCount),
    reviews: String(testimonials.length),
    avgRating: avgRating === "—" ? "0" : avgRating,
    serviceTypes,
    achievementTags,
    companies,
  };
}

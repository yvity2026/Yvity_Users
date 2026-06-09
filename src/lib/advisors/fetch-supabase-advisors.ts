import "server-only";

import { resolveProfileHeroStat } from "@/lib/advisor/profile-hero-stat";
import {
  calculateHighestExperienceYears,
} from "@/lib/advisor/publicMetrics";
import { mapDbServices } from "@/lib/server/supabase/mappers";
import { extractAchievementTags } from "@/lib/sections/achievement-tiers";
import {
  getEffectivePlan,
  hasIdentityVerified,
  hasVerifiedServices,
} from "@/lib/advisor/planFeatures";
import type { PublicAdvisorCard } from "@/lib/advisors/mock-public-advisors";
import { compareAdvisors } from "@/lib/advisors/publicAdvisorFilters";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";

const DEFAULT_CARD_METRICS = {
  exp: "0",
  reviews: "0",
  recs: "0",
  clients: "0",
  clientsLabel: "Clients",
};

const SEARCHABLE_SERVICE_TAGS = [
  "Life Insurance",
  "Health Insurance",
  "General Insurance",
];

function extractStateFromLocation(location: string) {
  if (!location?.includes(",")) return "";
  const segments = location.split(",");
  return segments[segments.length - 1]?.trim() ?? "";
}

import { getPublicProfileLivePath } from "@/lib/public-profile-url";

function countRowsByAdvisorId(rows: Array<{ advisor_id?: string }> = []) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!row.advisor_id) continue;
    counts.set(row.advisor_id, (counts.get(row.advisor_id) ?? 0) + 1);
  }
  return counts;
}

function averageRatingByAdvisorId(
  rows: Array<{ advisor_id?: string; testimonial_rating?: number; rating?: number }> = [],
) {
  const ratingsByAdvisor = new Map<string, number[]>();

  for (const row of rows) {
    const rating = Number(row.testimonial_rating ?? row.rating ?? 0);
    if (!row.advisor_id || !Number.isFinite(rating) || rating <= 0) continue;
    const ratings = ratingsByAdvisor.get(row.advisor_id) ?? [];
    ratings.push(rating);
    ratingsByAdvisor.set(row.advisor_id, ratings);
  }

  const averages = new Map<string, number>();
  for (const [advisorId, ratings] of ratingsByAdvisor) {
    const total = ratings.reduce((sum, rating) => sum + rating, 0);
    averages.set(advisorId, Number((total / ratings.length).toFixed(1)));
  }
  return averages;
}

type AdvisorProfileRow = {
  advisor_id: string;
  profile_slug: string | null;
  designation: string | null;
  subscription_plan: string | null;
  account_status: string | null;
  is_hero: boolean | null;
  is_landing: boolean | null;
};

function mapAdvisorToCard(
  profile: AdvisorProfileRow,
  usersById: Map<string, Record<string, unknown>>,
  scoresByAdvisorId: Map<string, { total_score?: number }>,
  servicesByAdvisorId: Map<string, Array<Record<string, unknown>>>,
  achievementsByAdvisorId: Map<string, Array<Record<string, unknown>>>,
  recommendationsCountByAdvisorId: Map<string, number>,
  testimonialsCountByAdvisorId: Map<string, number>,
  averageRatingByAdvisorIdMap: Map<string, number>,
): PublicAdvisorCard | null {
  const user = usersById.get(profile.advisor_id);
  if (!user) return null;

  const score = Number(scoresByAdvisorId.get(profile.advisor_id)?.total_score ?? 0);
  const services = servicesByAdvisorId.get(profile.advisor_id) ?? [];
  const effectivePlan = getEffectivePlan(
    profile.subscription_plan,
    profile.account_status,
  );
  const exp = calculateHighestExperienceYears(services);
  const serviceItems = mapDbServices(services);
  const heroStat = resolveProfileHeroStat(serviceItems, true);
  const recs = recommendationsCountByAdvisorId.get(profile.advisor_id) ?? 0;
  const reviews = testimonialsCountByAdvisorId.get(profile.advisor_id) ?? 0;
  const avgRating = averageRatingByAdvisorIdMap.get(profile.advisor_id) ?? 0;
  const city = String(user.city || "Location not available");
  const achievementRecords = achievementsByAdvisorId.get(profile.advisor_id) ?? [];
  const achievementTags = extractAchievementTags(
    achievementRecords.map((row) => ({
      title: String(row.title ?? ""),
      subtitle: String(row.organisation ?? ""),
      years: row.achievement_year ? [String(row.achievement_year)] : [],
    })),
  );

  return {
    id: profile.advisor_id,
    name: String(user.name || "Advisor"),
    title: String(profile.designation || user.profession || "Insurance Advisor"),
    location: city,
    state: extractStateFromLocation(city),
    avatarUrl: (user.selfie_url as string) || null,
    showIdentityVerified: hasIdentityVerified(user),
    showVerifiedBadge: hasVerifiedServices(
      profile.subscription_plan,
      profile.account_status,
    ),
    score: Math.max(0, Math.min(100, score)),
    profileUrl: getPublicProfileLivePath(profile.profile_slug ?? ""),
    profileSlug: profile.profile_slug ?? "",
    serviceTypes: [
      ...new Set(
        services
          .map((service) => String(service.service_type || ""))
          .filter((serviceType) => SEARCHABLE_SERVICE_TAGS.includes(serviceType)),
      ),
    ].slice(0, 3),
    achievementTags,
    companies: [
      ...new Set(services.map((service) => String(service.company || "")).filter(Boolean)),
    ],
    subscription_plan: effectivePlan,
    account_status: profile.account_status || "active",
    isHero: Boolean(profile.is_hero),
    isLanding: Boolean(profile.is_landing),
    ...DEFAULT_CARD_METRICS,
    exp,
    reviews: String(reviews),
    avgRating: String(avgRating),
    recs: String(recs),
    clients: heroStat.value === "—" ? "0" : heroStat.value,
    clientsLabel: heroStat.label,
  };
}

/** Loads public advisors from Supabase when configured; otherwise returns null. */
export async function fetchSupabasePublicAdvisors(
  excludeUserId?: string | null,
): Promise<PublicAdvisorCard[] | null> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return null;

  const { data: profiles, error: profilesError } = await supabase
    .from("advisor_profiles")
    .select(
      "advisor_id, profile_slug, designation, subscription_plan, account_status, is_hero, is_landing",
    )
    .eq("ispublic_profile", true)
    .not("profile_slug", "is", null);

  if (profilesError) {
    throw new Error(`Failed to load advisor profiles: ${profilesError.message}`);
  }

  if (!profiles?.length) {
    return [];
  }

  const advisorIds = profiles.map((profile) => profile.advisor_id);

  const [
    usersResult,
    scoresResult,
    servicesResult,
    achievementsResult,
    recommendationsResult,
    testimonialsResult,
  ] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, profession, city, selfie_url, mobile_verified")
      .in("id", advisorIds),
    supabase.from("advisor_scores").select("advisor_id, total_score").in("advisor_id", advisorIds),
    supabase
      .from("advisor_services")
      .select("advisor_id, service_type, company, no_of_clients, from_year, to_year")
      .in("advisor_id", advisorIds),
    supabase
      .from("advisor_achievements")
      .select("advisor_id, title, organisation, achievement_year")
      .in("advisor_id", advisorIds),
    supabase.from("advisor_recommendations").select("advisor_id").in("advisor_id", advisorIds),
    supabase
      .from("advisor_testimonials")
      .select("advisor_id, testimonial_rating")
      .in("advisor_id", advisorIds),
  ]);

  if (usersResult.error) {
    throw new Error(`Failed to load users: ${usersResult.error.message}`);
  }
  if (scoresResult.error) {
    throw new Error(`Failed to load advisor scores: ${scoresResult.error.message}`);
  }
  if (servicesResult.error) {
    throw new Error(`Failed to load advisor services: ${servicesResult.error.message}`);
  }
  if (achievementsResult.error) {
    throw new Error(`Failed to load advisor achievements: ${achievementsResult.error.message}`);
  }
  if (recommendationsResult.error) {
    throw new Error(
      `Failed to load advisor recommendations: ${recommendationsResult.error.message}`,
    );
  }
  if (testimonialsResult.error) {
    throw new Error(
      `Failed to load advisor testimonials: ${testimonialsResult.error.message}`,
    );
  }

  const usersById = new Map(
    (usersResult.data ?? []).map((user) => [user.id, user as Record<string, unknown>]),
  );
  const scoresByAdvisorId = new Map(
    (scoresResult.data ?? []).map((score) => [score.advisor_id, score]),
  );
  const servicesByAdvisorId = new Map<string, Array<Record<string, unknown>>>();
  const achievementsByAdvisorId = new Map<string, Array<Record<string, unknown>>>();
  const recommendationsCountByAdvisorId = countRowsByAdvisorId(recommendationsResult.data ?? []);
  const testimonialsCountByAdvisorId = countRowsByAdvisorId(testimonialsResult.data ?? []);
  const averageRatingByAdvisorIdMap = averageRatingByAdvisorId(testimonialsResult.data ?? []);

  for (const service of servicesResult.data ?? []) {
    const list = servicesByAdvisorId.get(service.advisor_id) ?? [];
    list.push(service as Record<string, unknown>);
    servicesByAdvisorId.set(service.advisor_id, list);
  }

  for (const achievement of achievementsResult.data ?? []) {
    const list = achievementsByAdvisorId.get(achievement.advisor_id) ?? [];
    list.push(achievement as Record<string, unknown>);
    achievementsByAdvisorId.set(achievement.advisor_id, list);
  }

  const advisors = (profiles as AdvisorProfileRow[])
    .map((profile) =>
      mapAdvisorToCard(
        profile,
        usersById,
        scoresByAdvisorId,
        servicesByAdvisorId,
        achievementsByAdvisorId,
        recommendationsCountByAdvisorId,
        testimonialsCountByAdvisorId,
        averageRatingByAdvisorIdMap,
      ),
    )
    .filter(Boolean) as PublicAdvisorCard[];

  const filtered = excludeUserId
    ? advisors.filter((advisor) => advisor.id !== excludeUserId)
    : advisors;

  return filtered.sort(compareAdvisors);
}

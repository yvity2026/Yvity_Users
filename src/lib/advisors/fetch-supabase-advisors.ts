import "server-only";

import { resolveProfileHeroStat } from "@/lib/advisor/profile-hero-stat";
import { computeHighestExperienceYears } from "@/lib/advisor/profession-experience";
import { mapDbServices, mapDbTestimonials } from "@/lib/server/supabase/mappers";
import { extractAchievementTags } from "@/lib/sections/achievement-tiers";
import {
  getEffectivePlan,
  hasIdentityVerified,
  hasVerifiedServices,
} from "@/lib/advisor/planFeatures";
import type { PublicAdvisorCard } from "@/lib/advisors/mock-public-advisors";
import { compareAdvisors } from "@/lib/advisors/publicAdvisorFilters";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";
import { parseGoldMeta } from "@/lib/server/supabase/gold-meta";
import { getPublicProfileLivePath } from "@/lib/public-profile-url";

const DEFAULT_CARD_METRICS = {
  exp: "0",
  reviews: "0",
  recs: "0",
  clients: "0",
  clientsLabel: "Clients",
};

// Title-case display names matching what AdvisorProfileCard expects
const SERVICE_TYPE_DISPLAY: Record<string, string> = {
  "life insurance": "Life Insurance",
  "health insurance": "Health Insurance",
  "general insurance": "General Insurance",
  "mutual funds": "Mutual Funds",
};

const SEARCHABLE_SERVICE_TAGS = ["Life Insurance", "Health Insurance", "General Insurance"];

function extractStateFromLocation(location: string) {
  if (!location?.includes(",")) return "";
  const segments = location.split(",");
  return segments[segments.length - 1]?.trim() ?? "";
}

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
  servicesByAdvisorId: Map<string, Array<Record<string, unknown>>>,
  achievementsByAdvisorId: Map<string, Array<Record<string, unknown>>>,
  testimonialsFullByAdvisorId: Map<string, Array<Record<string, unknown>>>,
  verifiedRecsCountByAdvisorId: Map<string, number>,
  testimonialsCountByAdvisorId: Map<string, number>,
  averageRatingByAdvisorIdMap: Map<string, number>,
  dbScoreByAdvisorId: Map<string, number>,
): PublicAdvisorCard | null {
  const user = usersById.get(profile.advisor_id);
  if (!user) return null;

  const services = servicesByAdvisorId.get(profile.advisor_id) ?? [];
  const serviceItems = mapDbServices(services);
  const achievementRecords = achievementsByAdvisorId.get(profile.advisor_id) ?? [];
  const testimonialsRaw = testimonialsFullByAdvisorId.get(profile.advisor_id) ?? [];
  const verifiedRecs = verifiedRecsCountByAdvisorId.get(profile.advisor_id) ?? 0;
  const photoUrl = (user.selfie_url as string) || undefined;

  // Single source of truth: read score from advisor_scores (written by /api/advisor/score/sync)
  const dbScore = dbScoreByAdvisorId.get(profile.advisor_id) ?? 0;

  const exp = String(computeHighestExperienceYears(serviceItems) ?? 0);
  const heroStat = resolveProfileHeroStat(serviceItems, true);
  const reviews = testimonialsCountByAdvisorId.get(profile.advisor_id) ?? 0;
  const avgRating = averageRatingByAdvisorIdMap.get(profile.advisor_id) ?? 0;
  const city = String(user.city || "Location not available");

  const achievementTags = extractAchievementTags(
    achievementRecords.map((row) => {
      const { meta } = parseGoldMeta(String(row.description ?? ""));
      const metaYears = Array.isArray(meta.years)
        ? (meta.years as unknown[]).map(String).filter(Boolean)
        : null;
      const baseYear = row.achievement_year ? [String(row.achievement_year)] : [];
      return {
        title: String(row.title ?? ""),
        subtitle: String(row.organisation ?? ""),
        years: metaYears ?? baseYear,
      };
    }),
  );

  // Normalize service_type to title case for card display
  const serviceTypes = [
    ...new Set(
      services
        .map((s) => {
          const raw = String(s.service_type || "").trim().toLowerCase();
          return SERVICE_TYPE_DISPLAY[raw] ?? String(s.service_type || "");
        })
        .filter((t) => SEARCHABLE_SERVICE_TAGS.includes(t)),
    ),
  ].slice(0, 3);

  const effectivePlan = getEffectivePlan(profile.subscription_plan, profile.account_status);

  return {
    id: profile.advisor_id,
    name: String(user.name || "Advisor"),
    title: String(profile.designation || user.profession || "Insurance Advisor"),
    location: city,
    state: extractStateFromLocation(city),
    avatarUrl: photoUrl || null,
    showIdentityVerified: hasIdentityVerified(user),
    showVerifiedBadge: hasVerifiedServices(profile.subscription_plan, profile.account_status),
    score: dbScore,
    profileUrl: getPublicProfileLivePath(profile.profile_slug ?? ""),
    profileSlug: profile.profile_slug ?? "",
    serviceTypes,
    achievementTags,
    companies: [
      ...new Set(services.map((s) => String(s.company || "")).filter(Boolean)),
    ],
    subscription_plan: effectivePlan,
    account_status: profile.account_status || "active",
    isHero: Boolean(profile.is_hero),
    isLanding: Boolean(profile.is_landing),
    ...DEFAULT_CARD_METRICS,
    exp,
    reviews: String(reviews),
    avgRating: String(avgRating),
    recs: String(verifiedRecs),
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
    .in("account_status", ["active", "under_review"])
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
    servicesResult,
    achievementsResult,
    testimonialsResult,
    recommendationsResult,
    scoresResult,
  ] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, profession, city, selfie_url, mobile_verified")
      .in("id", advisorIds),
    supabase
      .from("advisor_services")
      .select("advisor_id, service_type, company, no_of_clients, from_year, to_year, experience_years, key_services, short_summary, company_logo_url")
      .in("advisor_id", advisorIds),
    supabase
      .from("advisor_achievements")
      .select("advisor_id, title, organisation, achievement_year, description")
      .in("advisor_id", advisorIds),
    supabase
      .from("advisor_testimonials")
      .select("advisor_id, testimonial_rating, testimonial_type, is_mobile_verified, is_verified, status")
      .in("advisor_id", advisorIds),
    supabase
      .from("advisor_recommendations")
      .select("advisor_id, is_mobile_verified, is_verified")
      .in("advisor_id", advisorIds),
    // Single source of truth: scores written by /api/advisor/score/sync
    supabase
      .from("advisor_scores")
      .select("advisor_id, total_score")
      .in("advisor_id", advisorIds),
  ]);

  // Users are required to build cards — throw so the caller can surface the error.
  if (usersResult.error) throw new Error(`Failed to load users: ${usersResult.error.message}`);
  // Auxiliary data errors degrade gracefully (score=0, no tags, etc.) rather than hiding all advisors.
  if (servicesResult.error) console.error("[advisors] services fetch error:", servicesResult.error.message);
  if (achievementsResult.error) console.error("[advisors] achievements fetch error:", achievementsResult.error.message);
  if (testimonialsResult.error) console.error("[advisors] testimonials fetch error:", testimonialsResult.error.message);
  if (recommendationsResult.error) console.error("[advisors] recommendations fetch error:", recommendationsResult.error.message);

  const usersById = new Map(
    (usersResult.data ?? []).map((user) => [user.id, user as Record<string, unknown>]),
  );
  const servicesByAdvisorId = new Map<string, Array<Record<string, unknown>>>();
  const achievementsByAdvisorId = new Map<string, Array<Record<string, unknown>>>();
  const testimonialsFullByAdvisorId = new Map<string, Array<Record<string, unknown>>>();

  const testimonialsCountByAdvisorId = countRowsByAdvisorId(testimonialsResult.data ?? []);
  const averageRatingByAdvisorIdMap = averageRatingByAdvisorId(testimonialsResult.data ?? []);

  const verifiedRecsCountByAdvisorId = new Map<string, number>();
  for (const row of recommendationsResult.data ?? []) {
    if (!row.advisor_id) continue;
    if (row.is_mobile_verified || row.is_verified) {
      verifiedRecsCountByAdvisorId.set(
        row.advisor_id,
        (verifiedRecsCountByAdvisorId.get(row.advisor_id) ?? 0) + 1,
      );
    }
  }

  // DB score map — single source of truth
  const dbScoreByAdvisorId = new Map<string, number>(
    (scoresResult.data ?? [])
      .filter((row) => row.advisor_id && row.total_score != null)
      .map((row) => [row.advisor_id, Math.max(0, Math.min(100, Number(row.total_score)))]),
  );

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
  for (const testimonial of testimonialsResult.data ?? []) {
    const list = testimonialsFullByAdvisorId.get(testimonial.advisor_id) ?? [];
    list.push(testimonial as Record<string, unknown>);
    testimonialsFullByAdvisorId.set(testimonial.advisor_id, list);
  }

  const advisors = (profiles as AdvisorProfileRow[])
    .map((profile) =>
      mapAdvisorToCard(
        profile,
        usersById,
        servicesByAdvisorId,
        achievementsByAdvisorId,
        testimonialsFullByAdvisorId,
        verifiedRecsCountByAdvisorId,
        testimonialsCountByAdvisorId,
        averageRatingByAdvisorIdMap,
        dbScoreByAdvisorId,
      ),
    )
    .filter(Boolean) as PublicAdvisorCard[];

  const filtered = excludeUserId
    ? advisors.filter((advisor) => advisor.id !== excludeUserId)
    : advisors;

  return filtered.sort(compareAdvisors);
}

import "server-only";

import { hasVerifiedServices } from "@/lib/advisor/planFeatures";
import { loadPublicAdvisorCardMetrics } from "@/lib/advisors/build-public-advisor-card-metrics";
import { isAdvisorProfileLive } from "@/lib/server/public-view-context";
import { loadAllAdvisorProfiles } from "@/lib/server/advisor-profile-store";
import { loadRegistrationDb } from "@/lib/server/registration-store";
import type { PublicAdvisorCard } from "@/lib/advisors/mock-public-advisors";
import { getPublicProfileLivePath } from "@/lib/public-profile-url";

/** Local `.data` advisors visible on Find Advisors / slug resolution (approved profiles). */
export async function loadLocalPublicAdvisors(
  excludeUserId?: string | null,
): Promise<PublicAdvisorCard[]> {
  const db = await loadAllAdvisorProfiles();
  const users = loadRegistrationDb().users;
  const byId = new Map(users.map((u) => [u.id, u]));

  const cards: PublicAdvisorCard[] = [];

  for (const profile of Object.values(db.profiles)) {
    // Include active and under_review advisors — matches Supabase query in fetch-supabase-advisors.ts
    const status = String(profile.account_status || "").toLowerCase();
    if (status !== "active" && status !== "under_review") continue;
    if (excludeUserId && profile.user_id === excludeUserId) continue;

    const user = byId.get(profile.user_id);
    if (!user) continue;

    const city = [user.city, user.state].filter(Boolean).join(", ");
    const slug = profile.profile_slug?.trim() || "";
    const profileApproved = isAdvisorProfileLive(profile);
    const underReview = profile.account_status === "under_review";

    const metrics = await loadPublicAdvisorCardMetrics({
      userId: profile.user_id,
      photoUrl: user.selfieUrl,
      profileApproved,
      underReview,
      publicProfileActive: profileApproved,
      subscriptionPlan: profile.subscription_plan,
      accountStatus: profile.account_status,
    });

    cards.push({
      id: profile.user_id,
      name: user.fullName?.trim() || "Advisor",
      title: profile.designation?.trim() || user.profession?.trim() || "Insurance Advisor",
      location: city || "India",
      state: user.state?.trim() || "",
      avatarUrl: user.selfieUrl?.trim() || null,
      showIdentityVerified: Boolean(user.identity_verified_at),
      showVerifiedBadge: hasVerifiedServices(profile.subscription_plan, profile.account_status),
      score: metrics.score,
      profileUrl: getPublicProfileLivePath(slug),
      profileSlug: slug,
      serviceTypes: metrics.serviceTypes,
      achievementTags: metrics.achievementTags,
      companies: metrics.companies,
      subscription_plan: profile.subscription_plan ?? "free",
      account_status: profile.account_status,
      isHero: Boolean(profile.is_hero),
      isLanding: Boolean(profile.is_landing),
      exp: metrics.exp,
      reviews: metrics.reviews,
      avgRating: metrics.avgRating,
      recs: metrics.recs,
      clients: metrics.clients,
      clientsLabel: metrics.clientsLabel,
    });
  }

  return cards;
}

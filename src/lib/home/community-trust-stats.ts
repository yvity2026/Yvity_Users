import { buildCommunityTrustStatsFromCounts } from "@/lib/home/public-profile-banner-stats";

export type CommunityTrustStatId =
  | "profileViews"
  | "recommendations"
  | "testimonials"
  | "profileShares";

export type CommunityTrustStat = {
  id: CommunityTrustStatId;
  label: string;
  value: number;
  /** Optional trend copy — hidden when empty; ready for live telemetry later. */
  trend?: string;
};

export function getCommunityTrustStats(input: {
  testimonialCount: number;
  recommendationCount?: number;
  profileViews?: number;
  profileViewsDelta?: string;
  profileSharesByOthers?: number;
  profileSharesDelta?: string;
  profileApproved?: boolean;
}): CommunityTrustStat[] {
  const {
    testimonialCount,
    recommendationCount = 0,
    profileViews,
    profileViewsDelta,
    profileSharesByOthers,
    profileSharesDelta,
    profileApproved = true,
  } = input;

  return buildCommunityTrustStatsFromCounts({
    testimonialCount,
    recommendationCount,
    profileApproved,
    profileViews,
    clientSharers: profileSharesByOthers,
    profileViewsDelta,
    sharesDelta: profileSharesDelta,
  });
}

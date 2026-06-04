import { getEmptyAnalytics } from "@/lib/advisor-dashboard/demo-analytics";
import { getEmptyInsightsMetrics } from "@/lib/advisor-insights/demo-metrics";

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

export function getCommunityTrustStats(testimonialCount: number): CommunityTrustStat[] {
  const demo = getEmptyAnalytics();
  const metrics = getEmptyInsightsMetrics();

  return [
    {
      id: "profileViews",
      label: "Profile Views",
      value: demo.profileViews,
      trend: demo.profileViewsDelta,
    },
    {
      id: "recommendations",
      label: "Recommendations",
      value: demo.recommendationsReceived,
      trend: demo.recommendationGrowth,
    },
    {
      id: "testimonials",
      label: "Testimonials",
      value: testimonialCount,
      trend: demo.testimonialGrowth,
    },
    {
      id: "profileShares",
      label: "Profile Shares",
      value: metrics.profileShares,
      trend: metrics.sharesDelta,
    },
  ];
}

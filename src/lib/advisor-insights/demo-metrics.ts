import type { LeadServiceType } from "@/lib/leads/service-types";

function hashKey(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Phase-1 services highlighted in Insights (stable demo views per slug). */
export const INSIGHTS_SERVICE_IDS: { id: LeadServiceType; label: string }[] = [
  { id: "life", label: "Life Insurance" },
  { id: "health", label: "Health Insurance" },
  { id: "mutual", label: "Mutual Funds" },
  { id: "financial_planning", label: "Financial Planning" },
  { id: "claim", label: "Claim Assistance" },
];

export function getEmptyInsightsMetrics() {
  return {
    monthProfileViews: 0,
    monthViewsDelta: "0%",
    profileShares: 0,
    sharesDelta: "0%",
    contactRequestsDemo: 0,
    contactDelta: "0%",
    scoreTrend: "—",
    serviceViews(_serviceId: string): number {
      return 0;
    },
  };
}

export function getInsightsDemoMetrics(slug: string, totalProfileViews: number) {
  const h = hashKey(slug);
  const monthViews = Math.round(totalProfileViews * (0.22 + (h % 15) / 100));
  const profileShares = 24 + (h % 48);
  const contactRequestsBase = 8 + (h % 14);

  return {
    monthProfileViews: monthViews,
    monthViewsDelta: `+${14 + (h % 12)}%`,
    profileShares,
    sharesDelta: `+${3 + (h % 6)}`,
    contactRequestsDemo: contactRequestsBase,
    contactDelta: `+${2 + (h % 4)}`,
    scoreTrend: `+${3 + (h % 5)} pts this month`,
    serviceViews(serviceId: string): number {
      const sh = hashKey(`${slug}:${serviceId}`);
      return 32 + (sh % 145);
    },
  };
}

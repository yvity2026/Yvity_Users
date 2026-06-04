/** Demo analytics until product telemetry is wired — stable per advisor slug. */
export type DemoAnalytics = {
  profileViews: number;
  profileViewsDelta: string;
  searchAppearances: number;
  searchDelta: string;
  convertedLeads: number;
  recommendationsReceived: number;
  viewsTrend: number[];
  mostViewedService: string;
  mostViewedAchievement: string;
  testimonialGrowth: string;
  recommendationGrowth: string;
};

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Real zeros while profile is under admin review — no fabricated traffic yet. */
export function getEmptyAnalytics(): DemoAnalytics {
  return {
    profileViews: 0,
    profileViewsDelta: "0%",
    searchAppearances: 0,
    searchDelta: "0%",
    convertedLeads: 0,
    recommendationsReceived: 0,
    viewsTrend: [0, 0, 0, 0, 0, 0, 0],
    mostViewedService: "—",
    mostViewedAchievement: "—",
    testimonialGrowth: "0 this month",
    recommendationGrowth: "0 this month",
  };
}

export function getDemoAnalytics(slug: string, testimonialCount: number): DemoAnalytics {
  const h = hashSlug(slug);
  const baseViews = 420 + (h % 380);
  const trend = Array.from({ length: 7 }, (_, i) => {
    const wave = Math.sin((h % 10) + i * 0.9) * 12;
    return Math.round(18 + (h % 25) + i * 3 + wave);
  });

  return {
    profileViews: baseViews,
    profileViewsDelta: `+${12 + (h % 18)}%`,
    searchAppearances: 86 + (h % 64),
    searchDelta: `+${5 + (h % 9)}%`,
    convertedLeads: Math.max(1, Math.floor((h % 12) / 3) + 2),
    recommendationsReceived: Math.max(0, Math.floor(testimonialCount * 0.35) + (h % 5)),
    viewsTrend: trend,
    mostViewedService: ["Life Insurance", "Health Insurance", "Mutual Funds"][h % 3]!,
    mostViewedAchievement: ["MDRT Qualifier", "Team Leadership Award", "Client Excellence"][h % 3]!,
    testimonialGrowth: `+${Math.min(testimonialCount, 3 + (h % 4))} this month`,
    recommendationGrowth: `+${1 + (h % 3)} this month`,
  };
}

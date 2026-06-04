"use client";

import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, MessageSquareQuote, Share2, Star } from "lucide-react";
import {
  getCommunityTrustStats,
  type CommunityTrustStat,
  type CommunityTrustStatId,
} from "@/lib/home/community-trust-stats";
import { useTestimonialsData } from "@/lib/sections/stores";
import { StatCard, type StatCardAccent } from "@/components/ui/stat-card";

/**
 * Per-stat icon + accent mapping. We delegate ALL visual rendering
 * (glass surface, glow, hover lift, entrance animation, sheen) to the
 * shared `StatCard` so the Community Trust grid stays visually identical
 * to the Dashboard / Insights tiles.
 */
const STAT_META: Record<CommunityTrustStatId, { icon: LucideIcon; accent: StatCardAccent }> = {
  profileViews: { icon: Eye, accent: "cyan" },
  recommendations: { icon: Star, accent: "amber" },
  testimonials: { icon: MessageSquareQuote, accent: "emerald" },
  profileShares: { icon: Share2, accent: "violet" },
};

function formatStatValue(value: number): string {
  return value.toLocaleString("en-IN");
}

function CommunityTrustStatCard({
  stat,
  loading,
  index,
}: {
  stat: CommunityTrustStat;
  loading: boolean;
  index: number;
}) {
  const meta = STAT_META[stat.id];
  // Only the testimonials count is loaded async — show the skeleton
  // there. Everything else is derived from a deterministic seed.
  const isLoading = loading && stat.id === "testimonials";

  return (
    <li>
      <StatCard
        label={stat.label}
        value={formatStatValue(stat.value)}
        icon={meta.icon}
        accent={meta.accent}
        delta={stat.trend}
        index={index}
        loading={isLoading}
      />
    </li>
  );
}

export function CommunityTrustSection() {
  const [testimonials, , loading] = useTestimonialsData();
  const stats = useMemo(() => getCommunityTrustStats(testimonials.length), [testimonials.length]);

  return (
    <section className="w-full" aria-labelledby="community-trust-heading">
      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Social proof
      </p>
      <h2
        id="community-trust-heading"
        className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.08]"
      >
        <span className="text-gradient-brand">Community Trust</span>
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">
        Real engagement on this profile — visits, recommendations, testimonials and shares from the
        YVITY community.
      </p>

      <ul className="mt-5 sm:mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <CommunityTrustStatCard key={stat.id} stat={stat} loading={loading} index={index} />
        ))}
      </ul>
    </section>
  );
}

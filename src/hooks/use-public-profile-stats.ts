"use client";

import { useEffect, useState } from "react";
import { usePublicProfileView } from "@/context/public-profile-view-context";
import type { MonthlyScoreActivity } from "@/lib/advisor-score/decay";

type PublicProfileStatsResponse = {
  recommendationCount?: number;
  testimonialCount?: number;
  profileViews?: number;
  profileViewsDelta?: string;
  profileSharesByOthers?: number;
  profileSharesDelta?: string;
  decayPenalty?: number;
  decayActive?: boolean;
  graceDaysRemaining?: number | null;
  currentMonthActivity?: MonthlyScoreActivity;
};

/** Verified recommendation count and score decay for the public profile being viewed. */
export function usePublicProfileStats(): {
  recommendationCount: number;
  testimonialCount: number;
  profileViews: number;
  profileViewsDelta: string;
  profileSharesByOthers: number;
  profileSharesDelta: string;
  decayPenalty: number;
  decayActive: boolean;
  graceDaysRemaining: number | null;
  monthlyActivity: MonthlyScoreActivity | null;
  loading: boolean;
} {
  const publicView = usePublicProfileView();
  const [recommendationCount, setRecommendationCount] = useState(0);
  const [testimonialCount, setTestimonialCount] = useState(0);
  const [profileViews, setProfileViews] = useState(0);
  const [profileViewsDelta, setProfileViewsDelta] = useState("0%");
  const [profileSharesByOthers, setProfileSharesByOthers] = useState(0);
  const [profileSharesDelta, setProfileSharesDelta] = useState("0%");
  const [decayPenalty, setDecayPenalty] = useState(0);
  const [decayActive, setDecayActive] = useState(false);
  const [graceDaysRemaining, setGraceDaysRemaining] = useState<number | null>(null);
  const [monthlyActivity, setMonthlyActivity] = useState<MonthlyScoreActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void fetch("/api/public/profile-stats", { cache: "no-store", credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : { recommendationCount: 0 }))
      .then((json: PublicProfileStatsResponse) => {
        if (cancelled) return;
        setRecommendationCount(Math.max(0, json.recommendationCount ?? 0));
        setTestimonialCount(Math.max(0, json.testimonialCount ?? 0));
        setDecayPenalty(Math.max(0, json.decayPenalty ?? 0));
        setDecayActive(Boolean(json.decayActive));
        setGraceDaysRemaining(json.graceDaysRemaining ?? null);
        const activity = json.currentMonthActivity ?? null;
        setMonthlyActivity(activity);
        setProfileViews(Math.max(0, activity?.uniqueProfileViews ?? 0));
        setProfileSharesByOthers(Math.max(0, activity?.clientSharers ?? 0));
      })
      .catch(() => {
        if (!cancelled) {
          setRecommendationCount(0);
          setTestimonialCount(0);
          setDecayPenalty(0);
          setDecayActive(false);
          setGraceDaysRemaining(null);
          setMonthlyActivity(null);
          setProfileViews(0);
          setProfileViewsDelta("0%");
          setProfileSharesByOthers(0);
          setProfileSharesDelta("0%");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [publicView?.userId]);

  return {
    recommendationCount,
    testimonialCount,
    profileViews,
    profileViewsDelta,
    profileSharesByOthers,
    profileSharesDelta,
    decayPenalty,
    decayActive,
    graceDaysRemaining,
    monthlyActivity,
    loading,
  };
}

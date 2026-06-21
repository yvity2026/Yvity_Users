"use client";

import { useEffect, useState } from "react";
import type { MonthlyScoreActivity } from "@/lib/advisor-score/decay";
import type { ScoreNegativeRule } from "@/lib/advisor-score/types";

type ScoreActivityResponse = {
  decayPenalty?: number;
  decayActive?: boolean;
  graceDaysRemaining?: number | null;
  currentMonthActivity?: MonthlyScoreActivity;
  negativeRules?: ScoreNegativeRule[];
  profileViews?: number;
  profileViewsDelta?: string;
  totalProfileViews?: number;
  searchAppearances?: number;
  searchDelta?: string;
};

export function useScoreActivity(): {
  decayPenalty: number;
  decayActive: boolean;
  graceDaysRemaining: number | null;
  monthlyActivity: MonthlyScoreActivity | null;
  negativeRules: ScoreNegativeRule[] | null;
  profileViews: number;
  profileViewsDelta: string;
  totalProfileViews: number;
  searchAppearances: number;
  searchDelta: string;
  loading: boolean;
} {
  const [decayPenalty, setDecayPenalty] = useState(0);
  const [decayActive, setDecayActive] = useState(false);
  const [graceDaysRemaining, setGraceDaysRemaining] = useState<number | null>(null);
  const [monthlyActivity, setMonthlyActivity] = useState<MonthlyScoreActivity | null>(null);
  const [negativeRules, setNegativeRules] = useState<ScoreNegativeRule[] | null>(null);
  const [profileViews, setProfileViews] = useState(0);
  const [profileViewsDelta, setProfileViewsDelta] = useState("0%");
  const [totalProfileViews, setTotalProfileViews] = useState(0);
  const [searchAppearances, setSearchAppearances] = useState(0);
  const [searchDelta, setSearchDelta] = useState("0%");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/advisor/score-activity", { cache: "no-store", credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : {}))
      .then((json: ScoreActivityResponse) => {
        setDecayPenalty(Math.max(0, json.decayPenalty ?? 0));
        setDecayActive(Boolean(json.decayActive));
        setGraceDaysRemaining(json.graceDaysRemaining ?? null);
        setMonthlyActivity(json.currentMonthActivity ?? null);
        setNegativeRules(json.negativeRules ?? null);
        setProfileViews(Math.max(0, json.profileViews ?? 0));
        setProfileViewsDelta(json.profileViewsDelta ?? "0%");
        setTotalProfileViews(Math.max(0, json.totalProfileViews ?? 0));
        setSearchAppearances(Math.max(0, json.searchAppearances ?? 0));
        setSearchDelta(json.searchDelta ?? "0%");
      })
      .catch(() => {
        setDecayPenalty(0);
        setDecayActive(false);
        setGraceDaysRemaining(null);
        setMonthlyActivity(null);
        setNegativeRules(null);
        setProfileViews(0);
        setProfileViewsDelta("0%");
        setTotalProfileViews(0);
        setSearchAppearances(0);
        setSearchDelta("0%");
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    decayPenalty,
    decayActive,
    graceDaysRemaining,
    monthlyActivity,
    negativeRules,
    profileViews,
    profileViewsDelta,
    totalProfileViews,
    searchAppearances,
    searchDelta,
    loading,
  };
}

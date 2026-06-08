"use client";

import { useEffect, useState } from "react";

export function useVerifiedRecommendationCount(): {
  count: number;
  publishedCount: number;
  heldCount: number;
  totalCount: number;
  loading: boolean;
} {
  const [publishedCount, setPublishedCount] = useState(0);
  const [heldCount, setHeldCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/recommendations", { cache: "no-store", credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : { count: 0 }))
      .then(
        (json: {
          count?: number;
          publishedCount?: number;
          heldCount?: number;
          totalCount?: number;
        }) => {
          const published = Math.max(0, json.publishedCount ?? json.count ?? 0);
          const held = Math.max(0, json.heldCount ?? 0);
          const total = Math.max(0, json.totalCount ?? published + held);
          setPublishedCount(published);
          setHeldCount(held);
          setTotalCount(total);
        },
      )
      .catch(() => {
        setPublishedCount(0);
        setHeldCount(0);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    count: publishedCount,
    publishedCount,
    heldCount,
    totalCount,
    loading,
  };
}

"use client";

import { useEffect, useState } from "react";
import type { AmbassadorDashboardData } from "@/lib/advisor/ambassador-types";

export function useAdvisorAmbassador() {
  const [data, setData] = useState<AmbassadorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/advisor/ambassador", { cache: "no-store" })
      .then(async (res) => {
        const json = (await res.json()) as {
          success?: boolean;
          data?: AmbassadorDashboardData | null;
        };
        if (cancelled) return;
        if (!res.ok || !json.success) {
          setData(null);
          return;
        }
        setData(json.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading };
}

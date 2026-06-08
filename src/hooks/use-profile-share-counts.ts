"use client";

import { useEffect, useState } from "react";

export function useProfileShareCounts(): {
  selfShareCount: number;
  clientShareCount: number;
  loading: boolean;
} {
  const [selfShareCount, setSelfShareCount] = useState(0);
  const [clientShareCount, setClientShareCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/profile-shares", { cache: "no-store", credentials: "same-origin" })
      .then((res) =>
        res.ok ? res.json() : { selfShareCount: 0, clientShareCount: 0 },
      )
      .then((json: { selfShareCount?: number; clientShareCount?: number }) => {
        setSelfShareCount(Math.max(0, json.selfShareCount ?? 0));
        setClientShareCount(Math.max(0, json.clientShareCount ?? 0));
      })
      .catch(() => {
        setSelfShareCount(0);
        setClientShareCount(0);
      })
      .finally(() => setLoading(false));
  }, []);

  return { selfShareCount, clientShareCount, loading };
}

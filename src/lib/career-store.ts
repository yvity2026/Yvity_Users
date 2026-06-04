"use client";

import { useCallback, useEffect, useState } from "react";
import type { CareerData } from "./career-types";
import { emptyCareerData } from "./empty-data";

export { emptyCareerData as defaultCareerData } from "./empty-data";

const EVT = "career-data-updated";

async function fetchCareerData(): Promise<CareerData> {
  const res = await fetch("/api/career", { cache: "no-store" });
  if (!res.ok) return emptyCareerData;
  const json = (await res.json()) as { data?: CareerData };
  return json.data ?? emptyCareerData;
}

export function useCareerData(): [CareerData, (d: CareerData) => void, boolean] {
  const [data, setData] = useState<CareerData>(emptyCareerData);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setData(await fetchCareerData());
    } catch {
      setData(emptyCareerData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    const onUpdate = () => reload();
    window.addEventListener(EVT, onUpdate);
    return () => window.removeEventListener(EVT, onUpdate);
  }, [reload]);

  const update = (d: CareerData) => {
    setData(d);
    void fetch("/api/career", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    }).then(() => {
      window.dispatchEvent(new CustomEvent(EVT));
    });
  };

  return [data, update, loading];
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

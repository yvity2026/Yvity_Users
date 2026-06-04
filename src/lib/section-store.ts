"use client";

import { useCallback, useEffect, useState } from "react";

export { uid } from "@/lib/id";

export function createSectionStore<T>(endpoint: string, fallback: T, evt: string) {
  async function fetchData(): Promise<T> {
    const res = await fetch(endpoint, { cache: "no-store" });
    if (!res.ok) return fallback;
    const json = (await res.json()) as { data?: T };
    return json.data ?? fallback;
  }

  return function useSectionData(): [T, (data: T) => void, boolean] {
    const [data, setData] = useState<T>(fallback);
    const [loading, setLoading] = useState(true);

    const reload = useCallback(async () => {
      try {
        setData(await fetchData());
      } catch {
        setData(fallback);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      reload();
      const onUpdate = () => reload();
      window.addEventListener(evt, onUpdate);
      return () => window.removeEventListener(evt, onUpdate);
    }, [reload]);

    const update = (next: T) => {
      setData(next);
      void fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: next }),
      }).then(() => {
        window.dispatchEvent(new CustomEvent(evt));
      });
    };

    return [data, update, loading];
  };
}

"use client";

import { useCallback, useEffect, useState } from "react";

export { uid } from "@/lib/id";

export function createSectionStore<T>(endpoint: string, fallback: T, evt: string) {
  async function fetchData(): Promise<T> {
    const res = await fetch(endpoint, { cache: "no-store", credentials: "same-origin" });
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
      const prev = data;
      setData(next);
      // Persist to server — local state is already updated via setData(next) above.
      // We intentionally do NOT dispatch the custom event after PUT because that
      // would trigger reload() which re-fetches server data before it reflects the
      // save (race condition), clearing draft state and closing open editor modals.
      void fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ data: next }),
      }).then((res) => {
        if (!res.ok) {
          res.json().then((body: unknown) => {
            const msg = (body as { error?: string })?.error ?? `HTTP ${res.status}`;
            console.error(`[${endpoint} PUT] save failed:`, msg);
          }).catch(() => {
            console.error(`[${endpoint} PUT] save failed: HTTP ${res.status}`);
          });
          // Revert optimistic update so on-screen state matches what's actually saved
          setData(prev);
        }
      }).catch((err: unknown) => {
        console.error(`[${endpoint} PUT] network error:`, err);
        setData(prev);
      });
    };

    return [data, update, loading];
  };
}

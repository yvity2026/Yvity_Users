"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdvisorNotification } from "@/lib/notifications/types";

export function useNotifications(): {
  notifications: AdvisorNotification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
} {
  const [notifications, setNotifications] = useState<AdvisorNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    void fetch("/api/notifications", { cache: "no-store", credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : { data: [], unreadCount: 0 }))
      .then((json: { data?: AdvisorNotification[]; unreadCount?: number }) => {
        setNotifications(json.data ?? []);
        setUnreadCount(json.unreadCount ?? 0);
      })
      .catch(() => {
        setNotifications([]);
        setUnreadCount(0);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const markRead = async (id: string) => {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) return;
    const json = (await res.json()) as { unreadCount?: number };
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount(json.unreadCount ?? Math.max(0, unreadCount - 1));
  };

  const markAllRead = async () => {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    if (!res.ok) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, loading, refresh: load, markRead, markAllRead };
}

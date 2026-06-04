"use client";

import { useCallback, useEffect, useState } from "react";

const EVT = "yvity-auth-updated";

export type AuthUser = {
  id?: string;
  identifier: string;
  method: "phone" | "email";
  loggedInAt: number;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  profession?: string;
  selfie_url?: string | null;
  address_line?: string;
  pincode?: string;
  about?: string;
  roles?: string[];
  onboarding_cta_completed?: boolean;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const sync = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const json = (await res.json()) as { user: AuthUser | null };
      setUser(json.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    sync();
    const onAuth = () => sync();
    window.addEventListener(EVT, onAuth);
    return () => window.removeEventListener(EVT, onAuth);
  }, [sync]);

  return {
    user,
    ready,
    isAuthed: !!user,
    logout: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.dispatchEvent(new CustomEvent(EVT));
    },
    refresh: () => {
      window.dispatchEvent(new CustomEvent(EVT));
    },
  };
}

export function notifyAuthChanged() {
  window.dispatchEvent(new CustomEvent(EVT));
}

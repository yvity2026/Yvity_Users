"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultAdvisorSettings } from "@/lib/advisor-settings/defaults";
import { mergeAdvisorSettings } from "@/lib/advisor-settings/normalize";
import type { AdvisorSettings, AdvisorSettingsPatch } from "@/lib/advisor-settings/types";

type AdvisorSettingsContextValue = {
  settings: AdvisorSettings;
  loading: boolean;
  saving: boolean;
  updateSettings: (patch: AdvisorSettingsPatch) => void;
  setSettings: (next: AdvisorSettings) => void;
  reload: () => Promise<void>;
};

const AdvisorSettingsContext = createContext<AdvisorSettingsContextValue | null>(null);

export function AdvisorSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<AdvisorSettings>(defaultAdvisorSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store", credentials: "same-origin" });
      if (!res.ok) return;
      const json = (await res.json()) as { data?: AdvisorSettings };
      if (json.data) setSettingsState(json.data);
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    const onUpdate = () => void reload();
    window.addEventListener("advisor-settings-updated", onUpdate);
    return () => window.removeEventListener("advisor-settings-updated", onUpdate);
  }, [reload]);

  const persist = useCallback((next: AdvisorSettings) => {
    setSettingsState(next);
    setSaving(true);
    void fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: next }),
      credentials: "same-origin",
    })
      .then(() => {
        window.dispatchEvent(new CustomEvent("advisor-settings-updated"));
      })
      .finally(() => {
        setSaving(false);
      });
  }, []);

  const updateSettings = useCallback(
    (patch: AdvisorSettingsPatch) => {
      setSettingsState((prev) => {
        const next = mergeAdvisorSettings(prev, patch);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setSettings = useCallback(
    (next: AdvisorSettings) => {
      persist(next);
    },
    [persist],
  );

  const value = useMemo(
    () => ({ settings, loading, saving, updateSettings, setSettings, reload }),
    [settings, loading, saving, updateSettings, setSettings, reload],
  );

  return (
    <AdvisorSettingsContext.Provider value={value}>{children}</AdvisorSettingsContext.Provider>
  );
}

export function useAdvisorSettings(): AdvisorSettingsContextValue {
  const ctx = useContext(AdvisorSettingsContext);
  if (!ctx) {
    return {
      settings: defaultAdvisorSettings,
      loading: false,
      saving: false,
      updateSettings: () => {},
      setSettings: () => {},
      reload: async () => {},
    };
  }
  return ctx;
}

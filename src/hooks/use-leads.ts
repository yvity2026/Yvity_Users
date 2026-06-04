"use client";

import { useCallback, useEffect, useState } from "react";
import type { CreateLeadInput, Lead, UpdateLeadInput } from "@/lib/leads/types";

const fetchOpts: RequestInit = {
  cache: "no-store",
  credentials: "same-origin",
};

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else {
      setInitialLoading(true);
      setError(null);
    }
    try {
      const res = await fetch("/api/leads", fetchOpts);
      const json = (await res.json()) as { data?: Lead[]; error?: string };
      if (!res.ok) {
        const message = json.error ?? "Could not load leads";
        if (!silent) setError(message);
        throw new Error(message);
      }
      setLeads(json.data ?? []);
      if (!silent) setError(null);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Could not load leads");
        setLeads([]);
      }
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void reload(false);
  }, [reload]);

  const createLead = async (input: CreateLeadInput) => {
    const res = await fetch("/api/leads", {
      ...fetchOpts,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = (await res.json()) as { data?: Lead; error?: string };
    if (!res.ok) throw new Error(json.error ?? "Could not add lead");
    const created = json.data!;
    setLeads((prev) => [created, ...prev.filter((l) => l.id !== created.id)]);
    void reload(true);
    window.dispatchEvent(new CustomEvent("yvity-leads-updated"));
    return created;
  };

  const patchLead = async (id: string, patch: UpdateLeadInput) => {
    const res = await fetch(`/api/leads/${id}`, {
      ...fetchOpts,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = (await res.json()) as { data?: Lead; error?: string };
    if (!res.ok) throw new Error(json.error ?? "Could not update lead");
    const updated = json.data!;
    setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
    window.dispatchEvent(new CustomEvent("yvity-leads-updated"));
    return updated;
  };

  const removeLead = async (id: string) => {
    const res = await fetch(`/api/leads/${id}`, { ...fetchOpts, method: "DELETE" });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(json.error ?? "Could not delete lead");
    setLeads((prev) => prev.filter((l) => l.id !== id));
    window.dispatchEvent(new CustomEvent("yvity-leads-updated"));
  };

  return {
    leads,
    loading: initialLoading,
    refreshing,
    error,
    reload,
    createLead,
    patchLead,
    removeLead,
  };
}

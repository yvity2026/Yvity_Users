"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthUserContext";
import { getAdvisorWorkspaceSetupState } from "@/lib/advisor/workspaceSetupStatus";

export function useAdvisorWorkspaceSetup() {
  const { user, advisor, setUser, setAdvisor } = useAuth();
  const [pendingIrdaiUpload, setPendingIrdaiUpload] = useState(false);

  const setupState = getAdvisorWorkspaceSetupState(user, advisor, {
    pendingIrdaiUpload,
  });

  const refreshAuthState = useCallback(async () => {
    const [userRes, advisorRes] = await Promise.all([
      fetch("/api/auth/me", { cache: "no-store" }),
      fetch("/api/advisor/auth/me", { cache: "no-store" }),
    ]);

    if (userRes.ok) {
      const userResult = await userRes.json();
      const nextUser = userResult?.user ?? userResult?.data ?? null;
      setUser?.(nextUser);
    }

    if (advisorRes.ok) {
      const advisorResult = await advisorRes.json();
      setAdvisor?.(advisorResult?.data ?? advisorResult?.advisor ?? null);
    }
  }, [setUser, setAdvisor]);

  return {
    user,
    advisor,
    setupState,
    refreshAuthState,
    setPendingIrdaiUpload,
  };
}

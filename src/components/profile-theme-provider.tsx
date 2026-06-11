"use client";

import { useEffect, type ReactNode } from "react";
import {
  DEFAULT_PROFILE_THEME_ID,
  isDarkProfileTheme,
  isProfileThemeId,
} from "@/lib/profile-themes";
import { resolveThemeForPlan } from "@/lib/advisor-membership/plan-enforcement";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";

export function ProfileThemeProvider({ children }: { children: ReactNode }) {
  const { settings, loading } = useAdvisorSettings();
  const { planId } = usePlanLimits();

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = isProfileThemeId(settings.appearance.theme)
      ? settings.appearance.theme
      : DEFAULT_PROFILE_THEME_ID;
    const theme = loading
      ? DEFAULT_PROFILE_THEME_ID
      : resolveThemeForPlan(planId, savedTheme);

    root.setAttribute("data-profile-theme", theme);
    root.style.colorScheme = isDarkProfileTheme(theme) ? "dark" : "light";
  }, [settings.appearance.theme, loading, planId]);

  return <>{children}</>;
}

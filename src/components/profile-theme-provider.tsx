"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;

    // Advisor theme only applies in My Space — their profile preview area.
    // All other pages (landing, other dashboard sections, public pages) stay warm-ivory.
    if (!pathname.startsWith("/dashboard/my-space")) {
      root.setAttribute("data-profile-theme", DEFAULT_PROFILE_THEME_ID);
      root.style.colorScheme = "light";
      return;
    }

    const savedTheme = isProfileThemeId(settings.appearance.theme)
      ? settings.appearance.theme
      : DEFAULT_PROFILE_THEME_ID;
    const theme = loading
      ? DEFAULT_PROFILE_THEME_ID
      : resolveThemeForPlan(planId, savedTheme);

    root.setAttribute("data-profile-theme", theme);
    root.style.colorScheme = isDarkProfileTheme(theme) ? "dark" : "light";
  }, [settings.appearance.theme, loading, planId, pathname]);

  return <>{children}</>;
}

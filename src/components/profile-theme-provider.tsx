"use client";

import { useEffect, type ReactNode } from "react";
import { DEFAULT_PROFILE_THEME_ID, isDarkProfileTheme } from "@/lib/profile-themes";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";

export function ProfileThemeProvider({ children }: { children: ReactNode }) {
  const { settings, loading } = useAdvisorSettings();

  useEffect(() => {
    const root = document.documentElement;
    const theme = loading ? DEFAULT_PROFILE_THEME_ID : settings.appearance.theme;

    root.setAttribute("data-profile-theme", theme);
    root.style.colorScheme = isDarkProfileTheme(theme) ? "dark" : "light";
  }, [settings.appearance.theme, loading]);

  return <>{children}</>;
}

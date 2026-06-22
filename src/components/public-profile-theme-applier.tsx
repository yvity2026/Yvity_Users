"use client";

import { useEffect } from "react";
import { isDarkProfileTheme } from "@/lib/profile-themes";
import { usePublicProfileView } from "@/context/public-profile-view-context";
import { DEFAULT_PROFILE_THEME_ID } from "@/lib/profile-themes";

/**
 * Applies the advisor's chosen theme to <html> when viewing a public profile.
 * Must be inside PublicProfileViewProvider.
 */
export function PublicProfileThemeApplier() {
  const publicView = usePublicProfileView();
  const theme = publicView?.profileTheme ?? DEFAULT_PROFILE_THEME_ID;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-profile-theme", theme);
    root.style.colorScheme = isDarkProfileTheme(theme) ? "dark" : "light";
    return () => {
      // Restore default when leaving public profile
      root.setAttribute("data-profile-theme", DEFAULT_PROFILE_THEME_ID);
      root.style.colorScheme = "light";
    };
  }, [theme]);

  return null;
}

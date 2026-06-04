import {
  DEFAULT_PROFILE_THEME_ID,
  isProfileThemeId,
  type ProfileThemeId,
} from "@/yvity-gold/lib/profile-themes";

export function profileThemeFromAdvisorProfile(
  advisor: Record<string, unknown> | null | undefined,
): ProfileThemeId {
  const goldSettings = advisor?.gold_settings;
  if (!goldSettings || typeof goldSettings !== "object") {
    return DEFAULT_PROFILE_THEME_ID;
  }
  const theme = (goldSettings as { appearance?: { theme?: unknown } }).appearance?.theme;
  return isProfileThemeId(theme) ? theme : DEFAULT_PROFILE_THEME_ID;
}

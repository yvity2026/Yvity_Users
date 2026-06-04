import { defaultAdvisorSettings } from "./defaults";
import { isProfileThemeId } from "@/lib/profile-themes";
import type { AdvisorSettings, AdvisorSettingsPatch } from "./types";

function mergeSettings(base: AdvisorSettings, patch: AdvisorSettingsPatch): AdvisorSettings {
  const appearancePatch = patch.appearance;
  const theme =
    appearancePatch?.theme !== undefined && isProfileThemeId(appearancePatch.theme)
      ? appearancePatch.theme
      : base.appearance.theme;

  return {
    visibility: { ...base.visibility, ...patch.visibility },
    contact: { ...base.contact, ...patch.contact },
    leads: { ...base.leads, ...patch.leads },
    notifications: { ...base.notifications, ...patch.notifications },
    publicProfile: { ...base.publicProfile, ...patch.publicProfile },
    appearance: { theme },
    introVideo: { ...base.introVideo, ...patch.introVideo },
  };
}

export function normalizeAdvisorSettings(raw: unknown): AdvisorSettings {
  if (!raw || typeof raw !== "object") return defaultAdvisorSettings;
  return mergeSettings(defaultAdvisorSettings, raw as AdvisorSettingsPatch);
}

export function mergeAdvisorSettings(
  current: AdvisorSettings,
  patch: AdvisorSettingsPatch,
): AdvisorSettings {
  return mergeSettings(current, patch);
}

export { mergeSettings };

import { defaultAdvisorSettings } from "@/yvity-gold/lib/advisor-settings/defaults";
import { normalizeAdvisorSettings } from "@/yvity-gold/lib/advisor-settings/normalize";
import type { AdvisorSettings } from "@/yvity-gold/lib/advisor-settings/types";

type ProfileRow = Record<string, unknown>;
type UserRow = Record<string, unknown> | null;

export function mapDbToAdvisorSettings(
  profile: ProfileRow | null,
  user: UserRow,
): AdvisorSettings {
  const stored =
    profile?.gold_settings && typeof profile.gold_settings === "object"
      ? (profile.gold_settings as Partial<AdvisorSettings>)
      : {};

  const base = normalizeAdvisorSettings({
    ...defaultAdvisorSettings,
    ...stored,
    visibility: {
      ...defaultAdvisorSettings.visibility,
      careerJourney: stored.visibility?.careerJourney ?? (profile?.ispublic_professional !== false),
      achievements: stored.visibility?.achievements ?? (profile?.ispublic_achievements !== false),
      gallery: stored.visibility?.gallery ?? (profile?.ispublic_gallery !== false),
      individualServices: stored.visibility?.individualServices ?? (profile?.ispublic_services !== false),
      introductionVideo: stored.visibility?.introductionVideo ?? Boolean(String(profile?.intro_url || "").trim()),
      ...(stored.visibility ?? {}),
    },
    publicProfile: {
      ...defaultAdvisorSettings.publicProfile,
      profileActive: stored.publicProfile?.profileActive ?? (profile?.ispublic_profile !== false),
      ...(stored.publicProfile ?? {}),
    },
    introVideo: {
      ...defaultAdvisorSettings.introVideo,
      ...(stored.introVideo ?? {}),
      url: String(profile?.intro_url || stored.introVideo?.url || ""),
    },
    contact: {
      ...defaultAdvisorSettings.contact,
      ...(stored.contact ?? {}),
      showMobileNumber: profile?.show_contactdetails !== false,
    },
  });

  void user;
  return base;
}

export function mapAdvisorSettingsToDbPatch(settings: AdvisorSettings) {
  const normalized = normalizeAdvisorSettings(settings);

  return {
    ispublic_professional: normalized.visibility.careerJourney,
    ispublic_achievements: normalized.visibility.achievements,
    ispublic_gallery: normalized.visibility.gallery,
    ispublic_services: normalized.visibility.individualServices,
    ispublic_profile: normalized.publicProfile.profileActive,
    show_contactdetails: normalized.contact.showMobileNumber,
    intro_url: normalized.introVideo.url.trim() || "",
    gold_settings: {
      visibility: normalized.visibility,
      contact: normalized.contact,
      leads: normalized.leads,
      notifications: normalized.notifications,
      publicProfile: normalized.publicProfile,
      appearance: normalized.appearance,
      introVideo: {
        posterUrl: normalized.introVideo.posterUrl,
        durationLabel: normalized.introVideo.durationLabel,
      },
      location: normalized.location,
    },
  };
}

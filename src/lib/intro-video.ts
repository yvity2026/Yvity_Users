import type { AdvisorSettings, IntroVideoSettings } from "@/lib/advisor-settings/types";

/**
 * Intro video comes only from advisor settings (upload via IntroVideoUploadModal).
 * Empty URL means not configured — no demo video fallback.
 */
export type EffectiveIntroVideo = {
  url: string;
  posterUrl: string;
  durationLabel: string;
};

export function getEffectiveIntroVideo(settings?: AdvisorSettings | null): EffectiveIntroVideo {
  const customUrl = settings?.introVideo?.url?.trim();
  if (customUrl) {
    return {
      url: customUrl,
      posterUrl: settings?.introVideo?.posterUrl?.trim() ?? "",
      durationLabel: settings?.introVideo?.durationLabel?.trim() ?? "",
    };
  }

  return { url: "", posterUrl: "", durationLabel: "" };
}

/** Convenience: just the URL (empty string when not configured). */
export function getEffectiveIntroVideoUrl(settings?: AdvisorSettings | null): string {
  return getEffectiveIntroVideo(settings).url;
}

/** True when the advisor has any intro video — custom OR static fallback. */
export function hasIntroVideo(settings?: AdvisorSettings | null): boolean {
  return getEffectiveIntroVideoUrl(settings).length > 0;
}

/** Re-export for callers that only need the patch shape. */
export type IntroVideoPatch = Partial<IntroVideoSettings>;

import type { AdvisorSettings, IntroVideoSettings } from "@/lib/advisor-settings/types";
import type { PlanLimits } from "@/lib/advisor-membership/plan-limits";

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

/** Parse duration labels like `0:30`, `2:15`, or raw seconds. */
export function parseDurationLabelToSeconds(label: string | undefined | null): number | null {
  const trimmed = (label ?? "").trim();
  if (!trimmed) return null;

  const colonMatch = /^(\d+):(\d{1,2})$/.exec(trimmed);
  if (colonMatch) {
    const mins = Number(colonMatch[1]);
    const secs = Number(colonMatch[2]);
    if (Number.isFinite(mins) && Number.isFinite(secs) && secs < 60) {
      return mins * 60 + secs;
    }
    return null;
  }

  const asNumber = Number(trimmed);
  if (Number.isFinite(asNumber) && asNumber > 0) {
    return Math.round(asNumber);
  }

  return null;
}

type IntroVideoPlanLimits = Pick<
  PlanLimits,
  "introVideoEnabled" | "introVideoMaxSeconds" | "introVideoHeroPlacement"
>;

/**
 * Intro video visible on the public profile for the advisor's plan.
 * Stored videos over the duration cap are kept but hidden until upgraded/trimmed.
 */
export function getPlanGatedIntroVideo(
  settings: AdvisorSettings | null | undefined,
  limits: IntroVideoPlanLimits,
): EffectiveIntroVideo {
  if (!limits.introVideoEnabled) {
    return { url: "", posterUrl: "", durationLabel: "" };
  }

  const video = getEffectiveIntroVideo(settings);
  if (!video.url) return video;

  const durationSeconds = parseDurationLabelToSeconds(video.durationLabel);
  if (durationSeconds !== null && durationSeconds > limits.introVideoMaxSeconds) {
    return { url: "", posterUrl: "", durationLabel: "" };
  }

  return video;
}

/** Convenience: just the URL (empty string when not configured or not allowed). */
export function getPlanGatedIntroVideoUrl(
  settings: AdvisorSettings | null | undefined,
  limits: IntroVideoPlanLimits,
): string {
  return getPlanGatedIntroVideo(settings, limits).url;
}

/** Advisor workspace — counts toward profile health when plan allows intro video. */
export function getAdvisorIntroVideoUrl(
  settings: AdvisorSettings | null | undefined,
  limits: IntroVideoPlanLimits,
): string {
  if (!limits.introVideoEnabled) return "";
  return getEffectiveIntroVideoUrl(settings);
}

/** Convenience: just the URL (empty string when not configured). */
export function getEffectiveIntroVideoUrl(settings?: AdvisorSettings | null): string {
  return getEffectiveIntroVideo(settings).url;
}

/** True when the advisor has any intro video saved — regardless of plan. */
export function hasIntroVideo(settings?: AdvisorSettings | null): boolean {
  return getEffectiveIntroVideoUrl(settings).length > 0;
}

/** True when intro video is allowed and visible on the public profile. */
export function hasPublicIntroVideo(
  settings: AdvisorSettings | null | undefined,
  limits: IntroVideoPlanLimits,
): boolean {
  return getPlanGatedIntroVideoUrl(settings, limits).length > 0;
}

/** Re-export for callers that only need the patch shape. */
export type IntroVideoPatch = Partial<IntroVideoSettings>;

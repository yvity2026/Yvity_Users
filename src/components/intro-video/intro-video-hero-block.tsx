"use client";

import { Sparkles } from "lucide-react";
import { IntroVideoPublicPlayer } from "@/components/intro-video/intro-video-public-player";
import { useAdvisorDisplayProfile } from "@/hooks/use-advisor-display-profile";
import { useAdvisorProfilePhoto } from "@/hooks/use-advisor-profile-photo";
import { useResolvedPlanLimits } from "@/hooks/use-resolved-plan-limits";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { getPlanGatedIntroVideo } from "@/lib/intro-video";
import { cn } from "@/lib/utils";

/** Gold-only prominent intro video block in the profile hero. */
export function IntroVideoHeroBlock({ className }: { className?: string }) {
  const { settings } = useAdvisorSettings();
  const { limits } = useResolvedPlanLimits();
  const advisorProfile = useAdvisorDisplayProfile();
  const profilePhoto = useAdvisorProfilePhoto();

  if (!limits.introVideoHeroPlacement) return null;
  if (!settings.visibility.introductionVideo) return null;

  const video = getPlanGatedIntroVideo(settings, limits);
  if (!video.url) return null;

  return (
    <div className={cn("mt-4 sm:mt-5", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="size-3.5 text-[oklch(0.85_0.16_78)]" aria-hidden />
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Meet your advisor
        </p>
      </div>
      <IntroVideoPublicPlayer
        video={video}
        advisorName={advisorProfile.name}
        profilePhoto={profilePhoto}
        variant="hero"
      />
      <p className="mt-2 text-[11px] sm:text-xs text-muted-foreground leading-snug">
        Watch a short introduction before you connect.
      </p>
    </div>
  );
}

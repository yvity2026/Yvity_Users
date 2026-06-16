"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { getPlanGatedIntroVideo } from "@/lib/intro-video";
import { useAdvisorDisplayProfile } from "@/hooks/use-advisor-display-profile";
import { useAdvisorProfilePhoto } from "@/hooks/use-advisor-profile-photo";
import { useResolvedPlanLimits } from "@/hooks/use-resolved-plan-limits";
import { IntroVideoPublicPlayer } from "@/components/intro-video/intro-video-public-player";
import { usePublicYvityScore } from "@/hooks/use-public-yvity-score";
import { cn } from "@/lib/utils";

const YVITY_SCORE_MAX = 100;

const YVITY_SCORE_INFO =
  "YVITY Score is a credibility score calculated using profile completeness, verification status, professional information, activity and trust indicators.";

function TrustCardShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl",
        "glass-strong border border-white/10",
        "transition duration-300 hover:border-white/16 hover:shadow-[0_16px_32px_-20px_oklch(0_0_0/0.7)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent"
        aria-hidden
      />
      {children}
    </article>
  );
}

function ScoreInfoButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            // 36px hit area satisfies WCAG 2.5.5 target-size AA; the
            // glyph stays small and quiet.
            "inline-flex size-9 shrink-0 items-center justify-center rounded-full",
            "border border-white/12 bg-white/[0.04] text-muted-foreground",
            "transition hover:border-white/20 hover:bg-white/[0.08] hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.82_0.13_205/0.6)]",
          )}
          aria-label="About YVITY Score"
        >
          <Info className="size-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="border-white/12 glass-strong sm:max-w-md">
        <DialogHeader>
          <DialogTitle>YVITY Score</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed pt-1">
            {YVITY_SCORE_INFO}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export function IntroVideoTrustCard() {
  const { settings } = useAdvisorSettings();
  const { limits } = useResolvedPlanLimits();
  const advisorProfile = useAdvisorDisplayProfile();
  const video = getPlanGatedIntroVideo(settings, limits);
  const profilePhoto = useAdvisorProfilePhoto();
  const hasVideo = Boolean(video.url);

  return (
    <TrustCardShell className="p-2.5 sm:p-3">
      <div className="flex items-stretch gap-2.5 sm:gap-3">
        {hasVideo ? (
          <IntroVideoPublicPlayer
            video={video}
            advisorName={advisorProfile.name}
            profilePhoto={profilePhoto}
            variant="trust"
          />
        ) : (
          <div
            className={cn(
              "relative h-[4.25rem] w-[7.25rem] sm:h-[4.5rem] sm:w-[7.75rem] shrink-0 overflow-hidden rounded-lg",
              "border border-white/10 bg-black/25",
            )}
            aria-hidden
          >
            {profilePhoto ? (
              <Image
                src={profilePhoto}
                alt=""
                fill
                className="object-cover opacity-60 grayscale-[0.35]"
                sizes="124px"
                unoptimized={profilePhoto.startsWith("/api/")}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-[oklch(0.14_0.03_250)]" />
            )}
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
          <h3 className="text-xs sm:text-[13px] font-semibold tracking-tight text-foreground leading-tight">
            Advisor Introduction
          </h3>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-muted-foreground leading-snug line-clamp-2">
            {hasVideo
              ? "Know your advisor before you connect."
              : "Introduction video not added yet."}
          </p>
        </div>
      </div>
    </TrustCardShell>
  );
}

function YvityScoreProgressBar({ percent, loading }: { percent: number; loading: boolean }) {
  const [fill, setFill] = useState(0);
  const clamped = Math.min(YVITY_SCORE_MAX, Math.max(0, percent));

  useEffect(() => {
    const id = requestAnimationFrame(() => setFill(clamped));
    return () => cancelAnimationFrame(id);
  }, [clamped]);

  return (
    <div
      className="relative mt-2 h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-white/[0.08]"
      role="progressbar"
      aria-valuenow={loading ? undefined : clamped}
      aria-valuemin={0}
      aria-valuemax={YVITY_SCORE_MAX}
      aria-busy={loading || undefined}
      aria-label="YVITY Score progress"
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 rounded-full",
          "bg-gradient-to-r from-[oklch(0.85_0.16_78)] via-[oklch(0.82_0.13_205)] to-[oklch(0.78_0.16_162)]",
          "shadow-[0_0_16px_-2px_oklch(0.82_0.13_205/0.65)]",
          "transition-[width] duration-[1.1s] ease-out",
          loading && "opacity-40",
        )}
        style={{ width: loading ? "0%" : `${fill}%` }}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 rounded-full opacity-50",
          "bg-gradient-to-r from-transparent via-white/35 to-transparent",
          "transition-[width] duration-[1.1s] ease-out",
        )}
        style={{ width: loading ? "0%" : `${fill}%` }}
        aria-hidden
      />
    </div>
  );
}

export function YvityScoreTrustCard({ score, loading }: { score: number; loading: boolean }) {
  const displayScore = loading ? "—" : String(score);

  return (
    <TrustCardShell className="p-2.5 sm:p-3 text-center">
      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground leading-none">
          YVITY Score
        </p>
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <ScoreInfoButton />
        </div>
      </div>

      <div className="relative mt-1.5 sm:mt-2">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-10 w-24 -translate-x-1/2 rounded-full bg-[oklch(0.82_0.13_205/0.1)] blur-2xl"
          aria-hidden
        />
        <p
          className={cn(
            "relative font-bold tabular-nums tracking-tight leading-none",
            loading && "animate-pulse",
          )}
        >
          <span className="text-2xl sm:text-[1.65rem] text-foreground">{displayScore}</span>
          <span className="text-base sm:text-lg font-semibold text-muted-foreground">
            {" "}
            / {YVITY_SCORE_MAX}
          </span>
        </p>
        <YvityScoreProgressBar percent={score} loading={loading} />
      </div>
    </TrustCardShell>
  );
}

export function HomeTrustSection() {
  const { settings } = useAdvisorSettings();
  const { limits } = useResolvedPlanLimits();
  const { score, loading } = usePublicYvityScore();
  const showTrustStripVideo =
    settings.visibility.introductionVideo &&
    limits.introVideoEnabled &&
    !limits.introVideoHeroPlacement;

  return (
    <div
      className={cn(
        "mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-white/10",
        "grid gap-2.5 sm:gap-3",
        showTrustStripVideo ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-sm mx-auto md:max-w-none",
      )}
    >
      {showTrustStripVideo ? <IntroVideoTrustCard /> : null}
      <YvityScoreTrustCard score={score} loading={loading} />
    </div>
  );
}

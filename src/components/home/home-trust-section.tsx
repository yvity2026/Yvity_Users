"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { Info, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { advisorProfile } from "@/lib/advisor-profile";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { getEffectiveIntroVideo } from "@/lib/intro-video";
import { usePublicYvityScore } from "@/hooks/use-public-yvity-score";
import { useAuth } from "@/context/AuthUserContext";
import { resolveProfilePhotoUrl } from "@/lib/profile-photo";
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

function IntroVideoTrustCard() {
  const { settings } = useAdvisorSettings();
  const { user } = useAuth();
  const {
    url: introVideoUrl,
    posterUrl: introVideoPosterUrl,
    durationLabel: introVideoDuration,
  } = getEffectiveIntroVideo(settings);
  const profilePhoto =
    resolveProfilePhotoUrl(user?.selfie_url) || advisorProfile.photoUrl?.trim() || "";
  const poster = introVideoPosterUrl?.trim() || profilePhoto;
  const hasVideo = Boolean(introVideoUrl?.trim());
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const openPlayer = () => {
    if (!hasVideo) return;
    setOpen(true);
  };

  useEffect(() => {
    if (!open || !hasVideo) return;
    const el = videoRef.current;
    if (!el) return;
    void el.play().catch(() => undefined);
  }, [open, hasVideo]);

  return (
    <TrustCardShell className="p-2.5 sm:p-3">
      <div className="flex items-stretch gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={openPlayer}
          disabled={!hasVideo}
          className={cn(
            "group relative h-[4.25rem] w-[7.25rem] sm:h-[4.5rem] sm:w-[7.75rem] shrink-0 overflow-hidden rounded-lg",
            "border border-white/10 bg-black/25 text-left",
            hasVideo && "cursor-pointer",
            !hasVideo && "cursor-default",
          )}
          aria-label={
            hasVideo ? "Play advisor introduction video" : "Advisor introduction video preview"
          }
        >
          {poster ? (
            <Image
              src={poster}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              sizes="124px"
              unoptimized={poster.startsWith("/api/")}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-[oklch(0.14_0.03_250)]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

          <span
            className={cn(
              "absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2",
              "inline-flex size-9 items-center justify-center rounded-full",
              "bg-gradient-to-br from-[oklch(0.88_0.16_78)] to-[oklch(0.82_0.15_72)]",
              // Explicit dark teal foreground guarantees AA contrast on
              // the gold gradient and matches the Hero "Call Now" button.
              "text-[oklch(0.18_0.035_235)] shadow-[0_0_24px_-6px_oklch(0.85_0.16_78/0.85)] ring-2 ring-white/15",
              "transition duration-300",
              hasVideo && "group-hover:scale-105",
              // When the advisor hasn't uploaded a video we visually mute
              // the entire play button (border + chip) so it doesn't look
              // like a broken interactive control.
              !hasVideo && "opacity-60 grayscale-[0.35]",
            )}
          >
            <Play className="size-4 fill-current ml-0.5" />
          </span>

          {introVideoDuration && (
            <span className="absolute bottom-1.5 right-1.5 z-10 rounded-md border border-white/12 bg-black/55 px-1.5 py-px text-[9px] font-semibold tabular-nums text-white backdrop-blur-sm">
              {introVideoDuration}
            </span>
          )}
        </button>

        <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
          <h3 className="text-xs sm:text-[13px] font-semibold tracking-tight text-foreground leading-tight">
            Advisor Introduction
          </h3>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-muted-foreground leading-snug line-clamp-2">
            Know your advisor before you connect.
          </p>
        </div>
      </div>

      {hasVideo && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl gap-0 overflow-hidden border-white/12 bg-[oklch(0.16_0.035_235)] p-0 sm:rounded-2xl">
            <DialogHeader className="sr-only">
              <DialogTitle>Advisor Introduction</DialogTitle>
              <DialogDescription>Introduction video for {advisorProfile.name}</DialogDescription>
            </DialogHeader>
            <video
              ref={videoRef}
              className="aspect-video w-full bg-black object-contain"
              src={introVideoUrl}
              poster={introVideoPosterUrl || undefined}
              controls
              playsInline
              onEnded={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
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

function YvityScoreTrustCard({ score, loading }: { score: number; loading: boolean }) {
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
  const { score, loading } = usePublicYvityScore();
  const showVideo = settings.visibility.introductionVideo;

  return (
    <div
      className={cn(
        "mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-white/10",
        "grid gap-2.5 sm:gap-3",
        showVideo ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-sm mx-auto md:max-w-none",
      )}
    >
      {showVideo && <IntroVideoTrustCard />}
      <YvityScoreTrustCard score={score} loading={loading} />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EffectiveIntroVideo } from "@/lib/intro-video";
import { cn } from "@/lib/utils";

type IntroVideoPublicPlayerProps = {
  video: EffectiveIntroVideo;
  advisorName: string;
  profilePhoto?: string;
  variant?: "trust" | "hero";
  className?: string;
};

/** Shared intro-video thumbnail + modal player for public profile surfaces. */
export function IntroVideoPublicPlayer({
  video,
  advisorName,
  profilePhoto = "",
  variant = "trust",
  className,
}: IntroVideoPublicPlayerProps) {
  const { url, posterUrl, durationLabel } = video;
  const poster = posterUrl?.trim() || profilePhoto;
  const hasVideo = Boolean(url?.trim());
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open || !hasVideo) return;
    const el = videoRef.current;
    if (!el) return;
    void el.play().catch(() => undefined);
  }, [open, hasVideo]);

  if (!hasVideo) return null;

  const isHero = variant === "hero";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group relative overflow-hidden text-left",
          isHero
            ? "w-full aspect-video rounded-xl sm:rounded-2xl border border-white/12 bg-black/30 shadow-[0_16px_40px_-20px_oklch(0_0_0/0.75)]"
            : "h-[4.25rem] w-[7.25rem] sm:h-[4.5rem] sm:w-[7.75rem] shrink-0 rounded-lg border border-white/10 bg-black/25",
          className,
        )}
        aria-label="Play advisor introduction video"
      >
        {poster ? (
          <Image
            src={poster}
            alt=""
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes={isHero ? "(max-width: 768px) 100vw, 480px" : "124px"}
            unoptimized={poster.startsWith("/api/")}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-[oklch(0.14_0.03_250)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

        <span
          className={cn(
            "absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2",
            "inline-flex items-center justify-center rounded-full",
            "bg-gradient-to-br from-[oklch(0.88_0.16_78)] to-[oklch(0.82_0.15_72)]",
            "text-[oklch(0.18_0.035_235)] ring-2 ring-white/15 transition duration-300 group-hover:scale-105",
            isHero ? "size-14 sm:size-16 shadow-[0_0_32px_-8px_oklch(0.85_0.16_78/0.9)]" : "size-9 shadow-[0_0_24px_-6px_oklch(0.85_0.16_78/0.85)]",
          )}
        >
          <Play className={cn("fill-current ml-0.5", isHero ? "size-6 sm:size-7" : "size-4")} />
        </span>

        {durationLabel ? (
          <span
            className={cn(
              "absolute z-10 rounded-md border border-white/12 bg-black/55 font-semibold tabular-nums text-white backdrop-blur-sm",
              isHero
                ? "bottom-3 right-3 px-2 py-0.5 text-[11px]"
                : "bottom-1.5 right-1.5 px-1.5 py-px text-[9px]",
            )}
          >
            {durationLabel}
          </span>
        ) : null}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl gap-0 overflow-hidden border-white/12 bg-[oklch(0.16_0.035_235)] p-0 sm:rounded-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Advisor Introduction</DialogTitle>
            <DialogDescription>Introduction video for {advisorName}</DialogDescription>
          </DialogHeader>
          <video
            ref={videoRef}
            className="aspect-video w-full bg-black object-contain"
            src={url}
            poster={posterUrl || undefined}
            controls
            playsInline
            onEnded={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

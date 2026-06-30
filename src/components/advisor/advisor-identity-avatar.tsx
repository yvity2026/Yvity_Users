"use client";

import { useEffect, useId, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveProfilePhotoUrl } from "@/lib/profile-photo";

const SCORE_RING_R = 46.5;
const SCORE_RING_CIRC = 2 * Math.PI * SCORE_RING_R;

type AdvisorIdentityAvatarProps = {
  name: string;
  photoUrl?: string | null;
  showVerifiedBadge?: boolean;
  /** `hero` — profile header; `cta` — bottom advisor CTA card; `banner` — section banners */
  variant?: "hero" | "cta" | "banner";
  /** Adds teal brand ring + saffron gold glow — used on public profile page */
  goldGlow?: boolean;
  /** When provided, renders a YVITY score arc ring outside the avatar border */
  score?: number;
  className?: string;
};

const VARIANT_CLASS = {
  banner: {
    avatar: "size-16 sm:size-20",
    text: "text-lg sm:text-xl",
    badge: "size-6 sm:size-7",
    badgeIcon: "size-3.5 sm:size-4",
    ring: "ring-2 sm:ring-[3px]",
  },
  cta: {
    avatar: "size-20 sm:size-24 md:size-28",
    text: "text-xl sm:text-2xl",
    badge: "size-7 sm:size-8",
    badgeIcon: "size-4 sm:size-[1.125rem]",
    ring: "ring-[3px]",
  },
  hero: {
    avatar: "size-28 sm:size-32 md:size-36",
    text: "text-2xl sm:text-3xl",
    badge: "size-8 sm:size-9",
    badgeIcon: "size-4.5 sm:size-5",
    ring: "ring-[3px] sm:ring-4",
  },
} as const;

/** Canonical public-profile identity avatar — gradient ring, photo or initials, verified badge. */
export function AdvisorIdentityAvatar({
  name,
  photoUrl,
  showVerifiedBadge = false,
  variant = "cta",
  goldGlow = false,
  score,
  className,
}: AdvisorIdentityAvatarProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `aia-score-${uid}`;

  const styles = VARIANT_CLASS[variant];
  const resolvedPhoto = resolveProfilePhotoUrl(photoUrl) || "";
  const [imageError, setImageError] = useState(false);
  const showPhoto = Boolean(resolvedPhoto) && !imageError;

  useEffect(() => {
    setImageError(false);
  }, [resolvedPhoto]);

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const showScoreRing = score != null && score > 0;
  const numericScore = Math.min(100, Math.max(0, Number(score) || 0));
  const ringFilled = (numericScore / 100) * SCORE_RING_CIRC;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={goldGlow ? { filter: "drop-shadow(0 0 18px rgba(245,158,11,0.55)) drop-shadow(0 0 6px rgba(245,158,11,0.35))" } : undefined}
    >
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-full",
          "bg-gradient-to-br from-primary to-accent font-bold text-primary-foreground",
          styles.avatar,
          styles.text,
          styles.ring,
          goldGlow
            ? "ring-[var(--color-primary)] shadow-[0_0_0_4px_rgba(245,158,11,0.35),0_4px_24px_rgba(10,74,74,0.45)]"
            : "ring-[oklch(0.82_0.16_78/0.55)] shadow-lg shadow-primary/40",
        )}
      >
        {showPhoto ? (
          <img
            src={resolvedPhoto}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          initials
        )}
      </div>

      {/* YVITY score arc ring — teal-to-gold gradient, sits just outside the avatar border */}
      {showScoreRing && (
        <svg
          className="pointer-events-none absolute -inset-[6px] z-[2] h-[calc(100%+12px)] w-[calc(100%+12px)]"
          viewBox="0 0 100 100"
          aria-label={`YVITY Score ${numericScore}`}
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#0D6060" />
              <stop offset="50%"  stopColor="#14B8A6" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <filter id={`${gradId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Track */}
          <circle
            cx="50" cy="50" r={SCORE_RING_R}
            fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="3.5"
          />
          {/* Score arc */}
          <circle
            cx="50" cy="50" r={SCORE_RING_R}
            fill="none" stroke={`url(#${gradId})`} strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`${ringFilled} ${SCORE_RING_CIRC - ringFilled}`}
            transform="rotate(-90 50 50)"
            filter={`url(#${gradId}-glow)`}
          />
        </svg>
      )}

      {showVerifiedBadge ? (
        <span
          className={cn(
            "absolute bottom-0 right-0 translate-x-[15%] translate-y-[15%]",
            "inline-flex items-center justify-center rounded-full",
            "bg-[oklch(0.82_0.16_78)] text-[oklch(0.18_0.035_235)] shadow-md",
            "ring-[3px] ring-[oklch(0.18_0.035_235)]",
            styles.badge,
          )}
          aria-hidden
        >
          <BadgeCheck className={styles.badgeIcon} />
        </span>
      ) : null}
    </div>
  );
}

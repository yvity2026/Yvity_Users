"use client";

import { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveProfilePhotoUrl } from "@/lib/profile-photo";

type AdvisorIdentityAvatarProps = {
  name: string;
  photoUrl?: string | null;
  showVerifiedBadge?: boolean;
  /** `hero` — profile header; `cta` — bottom advisor CTA card; `banner` — section banners */
  variant?: "hero" | "cta" | "banner";
  /** Adds teal brand ring + saffron gold glow — used on public profile page */
  goldGlow?: boolean;
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
  className,
}: AdvisorIdentityAvatarProps) {
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

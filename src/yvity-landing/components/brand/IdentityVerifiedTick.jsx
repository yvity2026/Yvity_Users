"use client";

import { BadgeCheck } from "lucide-react";

const SIZE = {
  sm: {
    shell: "h-5 w-5 md:h-6 md:w-6",
    icon: "h-3 w-3 md:h-3.5 md:w-3.5",
  },
  md: {
    shell: "h-6 w-6 md:h-7 md:w-7",
    icon: "h-3.5 w-3.5 md:h-4 md:w-4",
  },
  lg: {
    shell: "h-7 w-7 md:h-8 md:w-8",
    icon: "h-4 w-4 md:h-[1.125rem] md:w-[1.125rem]",
  },
};

/**
 * YVITY identity verified mark — selfie / liveness (all plans).
 * Matches AdvisorIdentityAvatar badge: gold bg, BadgeCheck icon, teal ring.
 */
export function IdentityVerifiedTick({ size = "sm", className = "" }) {
  const config = SIZE[size] ?? SIZE.sm;

  return (
    <span
      className={`pointer-events-auto absolute bottom-0 right-0 z-[5] flex translate-x-[15%] translate-y-[15%] cursor-default items-center justify-center rounded-full shadow-md ${config.shell} bg-[oklch(0.82_0.16_78)] text-[oklch(0.18_0.035_235)] ring-[3px] ring-[oklch(0.18_0.035_235)] ${className}`}
      title="Identity Verified"
      aria-label="Identity Verified"
    >
      <BadgeCheck className={`shrink-0 ${config.icon}`} aria-hidden />
    </span>
  );
}

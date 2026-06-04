"use client";

import { UserCheck } from "lucide-react";

const SIZE = {
  sm: {
    shell: "h-5 w-5 md:h-6 md:w-6",
    icon: "h-2.5 w-2.5 md:h-3 md:w-3",
    ring: "ring-[1.5px] md:ring-2",
  },
  md: {
    shell: "h-6 w-6 md:h-7 md:w-7",
    icon: "h-3 w-3 md:h-3.5 md:w-3.5",
    ring: "ring-2",
  },
  lg: {
    shell: "h-7 w-7 md:h-8 md:w-8",
    icon: "h-3.5 w-3.5 md:h-4 md:w-4",
    ring: "ring-2 md:ring-[2.5px]",
  },
};

/**
 * YVITY identity verified mark — selfie / liveness (all plans).
 * Distinct from premium “Verified Services” profile badge.
 */
export function IdentityVerifiedTick({ size = "sm", className = "" }) {
  const config = SIZE[size] ?? SIZE.sm;

  return (
    <span
      className={`pointer-events-auto absolute bottom-0 right-0 z-[5] flex translate-x-[22%] translate-y-[22%] cursor-default items-center justify-center rounded-full bg-white p-[1.5px] shadow-[0_2px_8px_rgba(10,74,74,0.22)] ${config.shell} ${className}`}
      title="Identity Verified"
      aria-label="Identity Verified"
    >
      <span
        className={`relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#F59E0B] via-[#FBBF24] to-[#D97706] ${config.ring} ring-white`}
      >
        <span className="flex h-[calc(100%-3px)] w-[calc(100%-3px)] items-center justify-center rounded-full bg-[#0A4A4A] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
          <UserCheck
            className={`shrink-0 text-[#F59E0B] ${config.icon}`}
            strokeWidth={2.5}
            aria-hidden
          />
        </span>
      </span>
    </span>
  );
}

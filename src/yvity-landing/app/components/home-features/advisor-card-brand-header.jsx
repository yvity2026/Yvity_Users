"use client";

import Image from "next/image";
import BrandMark from "@/yvity-landing/components/brand/BrandMark";

/**
 * Profile card header — logo + YVITY + tagline (matches navbar BrandMark).
 */
export function AdvisorCardBrandHeader({
  variant = "dark",
  showVerifiedBadge = true,
  className = "",
}) {
  const isDark = variant === "dark";

  return (
    <header
      className={
        isDark
          ? `flex items-center gap-2 bg-gradient-to-r from-[#0A4A4A] via-[#0D5555] to-[#0A4A4A] px-3 py-2.5 sm:gap-2.5 sm:px-3.5 sm:py-3 ${className}`
          : `relative z-10 flex items-center justify-between gap-2 ${className}`
      }
    >
      <BrandMark
        logoSize={isDark ? 34 : 36}
        showName
        showTagline
        className="min-w-0 flex-1"
        logoClassName={`shrink-0 object-contain ${isDark ? "h-8 w-8 sm:h-9 sm:w-9" : "h-9 w-9 drop-shadow-sm"}`}
        nameClassName={
          isDark
            ? "font-cormorant text-sm font-bold leading-none text-white sm:text-base"
            : "font-cormorant text-sm font-bold leading-none text-[#0A4A4A] sm:text-base"
        }
        taglineClassName="font-poppins text-[9px] font-semibold leading-tight text-[#F59E0B] sm:text-[10px]"
      />

      {showVerifiedBadge ? (
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center sm:h-10 sm:w-10">
          <span
            className="absolute inset-0 rounded-full bg-[#F59E0B]/35 blur-md"
            aria-hidden
          />
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#F59E0B] bg-[#0A4A4A] shadow-[0_0_14px_rgba(245,158,11,0.5)] sm:h-9 sm:w-9">
            <Image
              src="/svgs/home/advisor_card/verified.svg"
              alt=""
              width={16}
              height={16}
              className="h-4 w-4"
            />
          </span>
        </div>
      ) : null}
    </header>
  );
}

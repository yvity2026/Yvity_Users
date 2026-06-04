"use client";

/**
 * Horizontal swipe row with scroll-snap (replaces auto-marquee on mobile).
 */
export default function LandingSnapScroll({
  children,
  className = "",
  ariaLabel = "Swipe to browse",
}) {
  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={`landing-snap-scroll no-scrollbar flex gap-4 overflow-x-auto overscroll-x-contain pb-2 ${className}`}
    >
      {children}
    </div>
  );
}

export function LandingSnapItem({ children, className = "" }) {
  return (
    <div className={`snap-start shrink-0 ${className}`}>{children}</div>
  );
}

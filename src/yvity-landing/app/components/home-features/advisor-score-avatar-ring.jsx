"use client";

const RING_RADIUS = 46.5;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Score ring: gold arc on dark header (high contrast), teal arc on light backgrounds. */
export function getYvityScoreAvatarRing(score, { onDarkHeader = false } = {}) {
  const numericScore = Math.min(100, Math.max(0, Number(score) || 0));
  // On dark teal header: amber/gold arc — matches card accent, clearly visible
  // On light backgrounds: teal arc graded by score quality
  const activeTeal = onDarkHeader
    ? "#F59E0B"
    : numericScore >= 75
      ? "#2DD4BF"
      : numericScore >= 40
        ? "#14B8A6"
        : "#0D6060";
  const trackTeal = onDarkHeader
    ? "rgba(255, 255, 255, 0.18)"
    : "rgba(13, 96, 96, 0.38)";

  return {
    numericScore,
    activeTeal,
    trackTeal,
    dashFilled: (numericScore / 100) * RING_CIRCUMFERENCE,
  };
}

/**
 * SVG score ring outside the gold photo border. Works at all scores (incl. 37).
 */
export function AdvisorScoreAvatarRing({
  score,
  onDarkHeader = false,
  className = "",
  children,
}) {
  const { numericScore, activeTeal, trackTeal, dashFilled } =
    getYvityScoreAvatarRing(score, { onDarkHeader });

  return (
    <div
      className={`relative inline-flex shrink-0 ${className}`.trim()}
      title={`YVITY Score ${Math.round(numericScore)}`}
    >
      {children}
      <svg
        className="pointer-events-none absolute -inset-[3px] z-[2] h-[calc(100%+6px)] w-[calc(100%+6px)]"
        viewBox="0 0 100 100"
        aria-hidden
      >
        {onDarkHeader && numericScore > 0 && (
          <defs>
            <filter id="ring-arc-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          stroke={trackTeal}
          strokeWidth="3.5"
        />
        {numericScore > 0 ? (
          <circle
            cx="50"
            cy="50"
            r={RING_RADIUS}
            fill="none"
            stroke={activeTeal}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`${dashFilled} ${RING_CIRCUMFERENCE - dashFilled}`}
            transform="rotate(-90 50 50)"
            filter={onDarkHeader ? "url(#ring-arc-glow)" : undefined}
          />
        ) : null}
      </svg>
    </div>
  );
}

"use client";

const RING_RADIUS = 46.5;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Teal outer ring: ~2px stroke; arc fill + brightness follow YVITY score (0–100). */
export function getYvityScoreAvatarRing(score, { onDarkHeader = false } = {}) {
  const numericScore = Math.min(100, Math.max(0, Number(score) || 0));
  const activeTeal = onDarkHeader
    ? numericScore >= 75
      ? "#5EEAD4"
      : numericScore >= 40
        ? "#2DD4BF"
        : "#22D3BD"
    : numericScore >= 75
      ? "#2DD4BF"
      : numericScore >= 40
        ? "#14B8A6"
        : "#0D6060";
  const trackTeal = onDarkHeader
    ? "rgba(94, 234, 212, 0.55)"
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
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          stroke={trackTeal}
          strokeWidth="2.75"
        />
        {numericScore > 0 ? (
          <circle
            cx="50"
            cy="50"
            r={RING_RADIUS}
            fill="none"
            stroke={activeTeal}
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeDasharray={`${dashFilled} ${RING_CIRCUMFERENCE - dashFilled}`}
            transform="rotate(-90 50 50)"
          />
        ) : null}
      </svg>
    </div>
  );
}

import { VERIFIED_BY_YVITY_LABEL } from "@/lib/verification/copy";
import { cn } from "@/lib/utils";

/** Compact "Verified by YVITY" seal for profile photos and avatars. */
export function YvityVerificationSeal({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "size-7" : "size-8 sm:size-9";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "bg-gradient-to-br from-[oklch(0.2_0.04_250)] via-[oklch(0.24_0.045_245)] to-[oklch(0.18_0.035_250)]",
        "border-2 border-[oklch(0.85_0.16_78/0.85)]",
        "shadow-[0_0_14px_-2px_oklch(0.85_0.16_78/0.55),0_4px_10px_-4px_oklch(0_0_0/0.6)]",
        "ring-2 ring-background",
        dim,
        className,
      )}
      title={VERIFIED_BY_YVITY_LABEL}
      aria-label={VERIFIED_BY_YVITY_LABEL}
    >
      <svg
        viewBox="0 0 32 32"
        className={cn(size === "sm" ? "size-5" : "size-5 sm:size-[1.35rem]")}
        aria-hidden
      >
        <path
          d="M16 3.5L26 8v7.2c0 5.2-3.4 10-8.2 11.5L16 27.5l-1.8-.8C9.4 25.2 6 20.4 6 15.2V8l10-4.5z"
          fill="oklch(0.85 0.16 78 / 0.15)"
          stroke="oklch(0.85 0.16 78)"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <path
          d="M11.5 16.2l2.8 2.8 6.2-6.4"
          fill="none"
          stroke="oklch(0.82 0.13 205)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="16"
          y="11.5"
          textAnchor="middle"
          fill="oklch(0.92 0.14 78)"
          fontSize="5.5"
          fontWeight="800"
          letterSpacing="0.08em"
          fontFamily="system-ui, sans-serif"
        >
          Y
        </text>
      </svg>
    </span>
  );
}

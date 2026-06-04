import { BadgeCheck } from "lucide-react";
import { VERIFIED_BY_YVITY_LABEL } from "@/lib/verification/copy";
import { cn } from "@/lib/utils";

/**
 * Public-profile badge shown on verified services (and, in future, verified
 * career / education / achievement entries).
 *
 * Copy is sourced from {@link VERIFIED_BY_YVITY_LABEL} so the phrasing
 * stays consistent across every surface that shows the badge.
 */
export function VerifiedByYvityBadge({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "xs";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border font-bold uppercase tracking-wider",
        "border-[oklch(0.85_0.16_78/0.45)] bg-[oklch(0.85_0.16_78/0.12)] text-[oklch(0.92_0.14_78)]",
        size === "xs" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]",
        className,
      )}
      aria-label={VERIFIED_BY_YVITY_LABEL}
    >
      <BadgeCheck className={size === "xs" ? "size-3" : "size-3.5"} aria-hidden />
      {VERIFIED_BY_YVITY_LABEL}
    </span>
  );
}

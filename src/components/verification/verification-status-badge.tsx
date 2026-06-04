import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import type { VerificationStatus } from "@/lib/verification/types";
import { VERIFIED_BY_YVITY_LABEL } from "@/lib/verification/copy";
import { cn } from "@/lib/utils";

const STYLES: Record<VerificationStatus, { label: string; icon: typeof Clock; classes: string }> = {
  pending: {
    label: "Pending Verification",
    icon: Clock,
    classes:
      "border-[oklch(0.85_0.16_78/0.45)] bg-[oklch(0.85_0.16_78/0.12)] text-[oklch(0.92_0.14_78)]",
  },
  verified: {
    label: VERIFIED_BY_YVITY_LABEL,
    icon: CheckCircle2,
    classes:
      "border-[oklch(0.82_0.16_162/0.5)] bg-[oklch(0.82_0.16_162/0.14)] text-[oklch(0.88_0.14_162)]",
  },
  rejected: {
    label: "Verification Rejected",
    icon: AlertTriangle,
    classes:
      "border-[oklch(0.72_0.18_15/0.5)] bg-[oklch(0.72_0.18_15/0.14)] text-[oklch(0.88_0.12_15)]",
  },
};

/** Dashboard-side badge that surfaces the current verification status. */
export function VerificationStatusBadge({
  status,
  className,
  size = "sm",
}: {
  status: VerificationStatus;
  className?: string;
  size?: "sm" | "xs";
}) {
  const style = STYLES[status];
  const Icon = style.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border font-semibold uppercase tracking-wider",
        size === "xs" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]",
        style.classes,
        className,
      )}
    >
      <Icon className={size === "xs" ? "size-3" : "size-3.5"} aria-hidden />
      {style.label}
    </span>
  );
}

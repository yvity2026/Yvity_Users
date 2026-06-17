"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { upgradePlanLabel } from "@/lib/advisor-membership/plan-limit-usage";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import { usePublicProfileNavHome } from "@/hooks/use-public-profile-nav-home";
import { cn } from "@/lib/utils";

type HeldContentUpgradeBannerProps = {
  heldTestimonialCount?: number;
  heldRecommendationCount?: number;
  heldByTestimonialType?: Partial<Record<"audio" | "video" | "text", number>>;
  upgradePlan?: MembershipPlanId | null;
  className?: string;
};

function formatHeldParts(input: {
  heldTestimonialCount?: number;
  heldRecommendationCount?: number;
  heldByTestimonialType?: Partial<Record<"audio" | "video" | "text", number>>;
}): string[] {
  const parts: string[] = [];
  const typeLabels: Record<string, string> = {
    video: "video testimonial",
    audio: "audio testimonial",
    text: "text testimonial",
  };

  if (input.heldByTestimonialType) {
    for (const type of ["video", "audio", "text"] as const) {
      const count = input.heldByTestimonialType[type] ?? 0;
      if (count <= 0) continue;
      parts.push(`${count} ${typeLabels[type]}${count === 1 ? "" : "s"}`);
    }
  } else if ((input.heldTestimonialCount ?? 0) > 0) {
    const count = input.heldTestimonialCount ?? 0;
    parts.push(`${count} testimonial${count === 1 ? "" : "s"}`);
  }

  const recCount = input.heldRecommendationCount ?? 0;
  if (recCount > 0) {
    parts.push(`${recCount} recommendation${recCount === 1 ? "" : "s"}`);
  }

  return parts;
}

export function HeldContentUpgradeBanner({
  heldTestimonialCount = 0,
  heldRecommendationCount = 0,
  heldByTestimonialType,
  upgradePlan,
  className,
}: HeldContentUpgradeBannerProps) {
  const profileHome = usePublicProfileNavHome();
  const parts = formatHeldParts({
    heldTestimonialCount,
    heldRecommendationCount,
    heldByTestimonialType,
  });

  if (parts.length === 0) return null;

  const summary = parts.join(" · ");
  const upgradeName = upgradePlanLabel(upgradePlan);

  return (
    <div
      className={cn(
        "rounded-2xl border border-[oklch(0.85_0.16_78/0.35)] bg-[oklch(0.85_0.16_78/0.08)] px-4 py-3",
        className,
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.85_0.16_78/0.15)] text-[oklch(0.92_0.14_78)]">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Client activity waiting to go live</p>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {summary} received from customers but hidden on your public profile due to plan limits.
            {upgradePlan ? ` Upgrade to ${upgradeName} to publish them.` : " Upgrade to publish them."}
          </p>
          {upgradePlan ? (
            <Link
              href={`${profileHome}?tab=membership`}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[oklch(0.85_0.16_78)] hover:underline"
            >
              <Lock className="size-3.5" />
              View upgrade options
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

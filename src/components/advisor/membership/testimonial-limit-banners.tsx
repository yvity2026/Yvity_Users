"use client";

import { PlanLimitBanner } from "@/components/advisor/membership/plan-limit-banner";
import { nextUpgradePlan } from "@/lib/advisor-membership/plan-limits";
import { listActiveTestimonialLimitRows } from "@/lib/advisor-membership/testimonial-limit-usage";
import type { PlanLimits } from "@/lib/advisor-membership/plan-limits";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import { testimonialTypeLabels } from "@/lib/sections/testimonials-config";
import type { TestimonialType } from "@/lib/sections/types";
import { cn } from "@/lib/utils";

type TestimonialLimitBannersProps = {
  limits: PlanLimits;
  counts: Record<TestimonialType, number>;
  planId: MembershipPlanId;
  showUpgradeLink?: boolean;
  visitorMode?: boolean;
  className?: string;
};

export function TestimonialLimitBanners({
  limits,
  counts,
  planId,
  showUpgradeLink = true,
  visitorMode = false,
  className,
}: TestimonialLimitBannersProps) {
  const rows = listActiveTestimonialLimitRows(limits, counts);
  if (rows.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {rows.map(({ type, usage }) => (
        <PlanLimitBanner
          key={type}
          usage={usage}
          resourceLabel={`${testimonialTypeLabels[type].toLowerCase()} testimonials`}
          upgradePlan={nextUpgradePlan(planId)}
          showUpgradeLink={showUpgradeLink && !visitorMode}
          visitorMessage={
            visitorMode && usage.atLimit
              ? `This advisor cannot accept new ${testimonialTypeLabels[type].toLowerCase()} testimonials on their current plan.`
              : undefined
          }
        />
      ))}
    </div>
  );
}

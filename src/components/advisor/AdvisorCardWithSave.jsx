"use client";

import { AdvisorProfileCard } from "@/yvity-landing/app/components/home-features/advisor-profile-card";
import { toAdvisorCardGoldProps } from "@/lib/advisor/cardGoldProps";
import { useAuth } from "@/context/AuthUserContext";
import AdvisorSaveButton from "@/components/advisor/AdvisorSaveButton";

/**
 * @param {{
 *   advisor: import("@/lib/advisors/mock-public-advisors").PublicAdvisorCard;
 *   variant?: "default" | "compact";
 *   showSave?: boolean;
 *   className?: string;
 * }} props
 */
export default function AdvisorCardWithSave({
  advisor,
  variant = "default",
  showSave = true,
  className = "",
}) {
  const { user } = useAuth();
  const cardProps = toAdvisorCardGoldProps(advisor);
  const canSave = showSave && Boolean(user?.id && advisor?.id);

  return (
    <div className={`relative ${className}`}>
      {canSave ? (
        <AdvisorSaveButton
          advisorId={advisor.id}
          advisorName={advisor.name}
          className="absolute right-2 top-2 z-20 sm:right-3 sm:top-3"
          size="sm"
        />
      ) : null}
      <AdvisorProfileCard variant={variant} {...cardProps} />
    </div>
  );
}

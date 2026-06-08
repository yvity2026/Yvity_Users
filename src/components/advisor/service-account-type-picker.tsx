"use client";

import {
  CAPACITY_ONBOARDING_ENABLED_ID,
  isCapacityComingSoon,
  isCapacityOnboardingEnabled,
  normalizeCapacityId,
  SERVICE_CAPACITY_OPTIONS,
  type ServiceCapacityId,
} from "@/lib/advisor/serviceCapacity";
import { cn } from "@/lib/utils";

type ServiceAccountTypePickerProps = {
  value: string;
  onChange?: (capacityId: ServiceCapacityId) => void;
  /** Setup flow uses luxury styling; editor uses dashboard styling. */
  variant?: "setup" | "editor";
  className?: string;
};

export function ServiceAccountTypePicker({
  value,
  onChange,
  variant = "setup",
  className,
}: ServiceAccountTypePickerProps) {
  const selected = normalizeCapacityId(value) || CAPACITY_ONBOARDING_ENABLED_ID;
  const legacySaved = isCapacityComingSoon(selected);
  const isSetup = variant === "setup";

  const selectCapacity = (capacityId: ServiceCapacityId) => {
    if (!onChange || !isCapacityOnboardingEnabled(capacityId)) return;
    onChange(capacityId);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn("grid gap-2", isSetup ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1")}>
        {SERVICE_CAPACITY_OPTIONS.map((option) => {
          const enabled = isCapacityOnboardingEnabled(option.id);
          const isSelected = selected === option.id;
          const comingSoon = isCapacityComingSoon(option.id);

          return (
            <button
              key={option.id}
              type="button"
              disabled={!enabled || legacySaved}
              onClick={() => selectCapacity(option.id)}
              className={cn(
                "relative rounded-xl border px-3 py-2.5 text-left transition",
                isSetup ? "font-poppins text-xs font-semibold" : "text-sm font-medium",
                enabled && !legacySaved
                  ? isSelected
                    ? isSetup
                      ? "border-[#0A4A4A] bg-[#F0FAFA] text-[#0A4A4A]"
                      : "border-primary bg-primary/10 text-foreground"
                    : isSetup
                      ? "border-[#E2E8F0] text-[#64748B] hover:border-[#0A4A4A]/30"
                      : "border-input bg-background/50 text-muted-foreground hover:border-primary/30"
                  : "cursor-not-allowed border-[#E2E8F0]/80 bg-[#F8FAFC] text-[#94A3B8]",
              )}
            >
              <span className="block">{option.label}</span>
              {enabled && option.id === CAPACITY_ONBOARDING_ENABLED_ID ? (
                <span
                  className={cn(
                    "mt-1 block text-[10px] font-normal leading-snug",
                    isSetup ? "text-[#64748B]" : "text-muted-foreground",
                  )}
                >
                  Advisor · Relationship manager · Independent professional
                </span>
              ) : null}
              {comingSoon ? (
                <span
                  className={cn(
                    "mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    isSetup ? "bg-[#FEF3C7] text-[#92400E]" : "bg-amber-500/15 text-amber-700",
                  )}
                >
                  Coming soon
                </span>
              ) : null}
              {legacySaved && isSelected ? (
                <span
                  className={cn(
                    "mt-1 block text-[10px] font-normal leading-snug",
                    isSetup ? "text-[#64748B]" : "text-muted-foreground",
                  )}
                >
                  Saved for a future release
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {legacySaved ? (
        <p
          className={cn(
            "text-[11px] leading-relaxed",
            isSetup ? "font-poppins text-[#64748B]" : "text-muted-foreground",
          )}
        >
          This service uses{" "}
          <span className="font-semibold text-foreground">
            {SERVICE_CAPACITY_OPTIONS.find((o) => o.id === selected)?.label}
          </span>
          . Team and firm features stay hidden while we onboard our first advisors — your saved
          data is kept for later.
        </p>
      ) : (
        <p
          className={cn(
            "text-[11px] leading-relaxed",
            isSetup ? "font-poppins text-[#94A3B8]" : "text-muted-foreground",
          )}
        >
          {SERVICE_CAPACITY_OPTIONS.find((o) => o.id === CAPACITY_ONBOARDING_ENABLED_ID)?.description}
          . Team Leader and Firm / Company options will open after our initial advisor cohort and
          pricing is finalised.
        </p>
      )}
    </div>
  );
}

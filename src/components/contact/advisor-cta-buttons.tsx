"use client";

import { Phone, PhoneIncoming } from "lucide-react";
import { ContactTrigger } from "@/components/contact/contact-trigger";
import { useAdvisorDisplayProfile } from "@/hooks/use-advisor-display-profile";
import { useShowProfileCallback } from "@/hooks/use-show-profile-callback";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const btnShared = "h-11 min-w-0 flex-1 rounded-full text-xs sm:text-sm font-semibold px-3 sm:px-4";

/** Call Now + Request Call Back — shared by home hero and section CTA card. */
export function AdvisorCtaButtons({
  className,
  layout = "stacked",
}: {
  className?: string;
  /** `row` — side by side (home). `stacked` — vertical (section CTA card). */
  layout?: "stacked" | "row";
}) {
  const { settings } = useAdvisorSettings();
  const advisorProfile = useAdvisorDisplayProfile();
  const telHref = `tel:${advisorProfile.phone.replace(/\s/g, "")}`;
  const isRow = layout === "row";
  const showCall = settings.contact.callButton;
  const showCallback = useShowProfileCallback();

  if (!showCall && !showCallback) return null;

  return (
    <div className={cn("flex w-full gap-2.5", isRow ? "flex-row" : "flex-col", className)}>
      {showCall && (
        <Button
          asChild
          className={cn(
            btnShared,
            !isRow && "w-full flex-none",
            "bg-[oklch(0.82_0.16_78)] text-primary shadow-lg shadow-[oklch(0.82_0.16_78/0.25)] hover:bg-[oklch(0.86_0.15_78)]",
          )}
        >
          <a href={telHref}>
            <Phone className="size-4 shrink-0" />
            Call Now
          </a>
        </Button>
      )}
      {showCallback && (
        <ContactTrigger
          variant="outline"
          className={cn(
            btnShared,
            !isRow && "w-full flex-none",
            "border-white/25 bg-white/[0.04] text-foreground hover:bg-white/10 hover:text-foreground",
          )}
        >
          <PhoneIncoming className="size-4 shrink-0 text-[oklch(0.82_0.13_205)]" />
          <span className="truncate">Request Call Back</span>
        </ContactTrigger>
      )}
    </div>
  );
}

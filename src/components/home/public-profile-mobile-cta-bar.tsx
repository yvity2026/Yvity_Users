"use client";

import { Phone, PhoneIncoming } from "lucide-react";
import { ContactTrigger } from "@/components/contact/contact-trigger";
import { useAdvisorDisplayProfile } from "@/hooks/use-advisor-display-profile";
import { useIsAdvisorWorkspacePreview } from "@/hooks/use-is-viewing-own-advisor-profile";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Sticky conversion bar on small screens — duplicates hero CTAs so Call /
 * Callback stay reachable without scrolling past the full profile header.
 */
export function PublicProfileMobileCtaBar() {
  const advisorProfile = useAdvisorDisplayProfile();
  const { settings } = useAdvisorSettings();
  const isWorkspacePreview = useIsAdvisorWorkspacePreview();

  const showCall = settings.contact.callButton;
  const showCallback =
    !isWorkspacePreview &&
    settings.contact.contactForm &&
    settings.leads.acceptNewLeads &&
    settings.leads.publicProfileEnquiries;

  if (!showCall && !showCallback) return null;

  const telHref = `tel:${advisorProfile.phone.replace(/\s/g, "")}`;

  return (
    <div
      className={cn(
        "lg:hidden fixed inset-x-0 bottom-0 z-40",
        "border-t border-white/10 bg-background/95 backdrop-blur-xl",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 px-3",
      )}
      role="region"
      aria-label="Contact advisor"
    >
      <div className="mx-auto flex max-w-lg gap-2">
        {showCall ? (
          <Button
            asChild
            className="h-11 flex-1 rounded-full text-sm font-semibold gap-2 bg-gradient-to-r from-[oklch(0.88_0.16_78)] to-[oklch(0.82_0.15_72)] text-[oklch(0.18_0.035_235)] shadow-md"
          >
            <a href={telHref}>
              <Phone className="size-4 shrink-0" />
              Call
            </a>
          </Button>
        ) : null}
        {showCallback ? (
          <ContactTrigger
            variant="outline"
            className="h-11 flex-1 rounded-full text-sm font-semibold gap-2 border-white/20 bg-white/[0.04]"
          >
            <PhoneIncoming className="size-4 shrink-0 text-[oklch(0.82_0.13_205)]" />
            Callback
          </ContactTrigger>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { AdvisorIdentityAvatar } from "@/components/advisor/advisor-identity-avatar";
import { useAdvisorDisplayProfile } from "@/hooks/use-advisor-display-profile";
import {
  useAdvisorProfilePhoto,
  useShowAdvisorVerifiedBadge,
} from "@/hooks/use-advisor-profile-photo";
import { cn } from "@/lib/utils";

/** Compact identity avatar for section page banners (career, services, testimonials, …). */
export function SectionBannerAdvisorIdentity({ className }: { className?: string }) {
  const display = useAdvisorDisplayProfile();
  const photoUrl = useAdvisorProfilePhoto();
  const showVerifiedBadge = useShowAdvisorVerifiedBadge();

  return (
    <AdvisorIdentityAvatar
      className={cn("mx-auto lg:mx-0", className)}
      name={display.name}
      photoUrl={photoUrl}
      showVerifiedBadge={showVerifiedBadge}
      variant="banner"
    />
  );
}

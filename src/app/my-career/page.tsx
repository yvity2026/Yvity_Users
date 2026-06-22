"use client";

import { usePathname } from "next/navigation";
import { PublicProfileSectionRedirect } from "@/components/public-profile-section-redirect";
import { PublicSectionUnavailable } from "@/components/advisor/settings/public-section-unavailable";
import { useCareerData } from "@/lib/career-store";
import { CareerSectionsAccordion } from "@/components/career/career-sections-accordion";
import { SectionAdvisorCta } from "@/components/sections/section-advisor-cta";
import { SectionProfileBanner } from "@/components/sections/section-profile-banner";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { useAuth } from "@/context/AuthUserContext";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { useResolvedPublicAdvisorPayload } from "@/hooks/use-resolved-public-advisor-payload";
import { usePublicProfileNavHome } from "@/hooks/use-public-profile-nav-home";
import { useAdvisorDisplayProfile } from "@/hooks/use-advisor-display-profile";

export default function MyCareerPage() {
  const homeHref = usePublicProfileNavHome();
  const pathname = usePathname();
  const [data, , loading] = useCareerData();
  const display = useAdvisorDisplayProfile();
  const { settings, loading: settingsLoading } = useAdvisorSettings();
  const { advisor } = useAuth();
  const publicAdvisor = useResolvedPublicAdvisorPayload();
  const profileApproved = publicAdvisor
    ? isAdvisorProfileApproved(publicAdvisor.profile)
    : isAdvisorProfileApproved(advisor);

  // Redirect visitors from /my-career to /{slug}/my-career — skip if already there
  const needsRedirect =
    homeHref && homeHref !== "/profile" && !pathname.startsWith(homeHref + "/");
  if (needsRedirect) {
    return <PublicProfileSectionRedirect section="my-career" />;
  }

  if (loading || settingsLoading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-sm text-muted-foreground">
        Loading profile…
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-6xl px-4 md:px-6 pt-8 md:pt-16 pb-2">
        <div className="mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground">
            YVITY · Profile
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            My Career
          </h1>
        </div>
        <SectionProfileBanner className="mb-6 sm:mb-8" statsOverride={display.careerStats} />
        {!settings.visibility.careerJourney && !settings.visibility.educationalJourney ? (
          <PublicSectionUnavailable title="Career sections hidden" />
        ) : (
          <CareerSectionsAccordion
            experiences={data.experiences}
            certifications={data.certifications}
            education={data.education}
            showCareerJourney={settings.visibility.careerJourney}
            showEducationalJourney={settings.visibility.educationalJourney}
            profileApproved={profileApproved}
          />
        )}
        <SectionAdvisorCta className="mt-8 sm:mt-10" />
      </div>
    </main>
  );
}

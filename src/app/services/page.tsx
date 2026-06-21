"use client";

import { PublicProfileSectionRedirect } from "@/components/public-profile-section-redirect";
import { usePublicProfileNavHome } from "@/hooks/use-public-profile-nav-home";
import { ServicesShowcase } from "@/components/sections/services-showcase";

export default function ServicesPage() {
  const homeHref = usePublicProfileNavHome();

  // Redirect visitors to slug-prefixed URL
  if (homeHref && homeHref !== "/profile") {
    return <PublicProfileSectionRedirect section="services" />;
  }

  return <ServicesShowcase />;
}

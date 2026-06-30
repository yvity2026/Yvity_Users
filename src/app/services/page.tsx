"use client";

import { usePathname } from "next/navigation";
import { PublicProfileSectionRedirect } from "@/components/public-profile-section-redirect";
import { usePublicProfileNavHome } from "@/hooks/use-public-profile-nav-home";
import { ServicesShowcase } from "@/components/sections/services-showcase";

export default function ServicesPage() {
  const homeHref = usePublicProfileNavHome();
  const pathname = usePathname();

  const needsRedirect =
    homeHref && homeHref !== "/profile" && !pathname.startsWith(homeHref + "/");
  if (needsRedirect) {
    return <PublicProfileSectionRedirect section="services" />;
  }

  return <ServicesShowcase />;
}

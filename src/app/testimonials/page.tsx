"use client";

import { usePathname } from "next/navigation";
import { PublicProfileSectionRedirect } from "@/components/public-profile-section-redirect";
import { usePublicProfileNavHome } from "@/hooks/use-public-profile-nav-home";
import { Suspense } from "react";
import { TestimonialsShowcase } from "@/components/sections/testimonials-showcase";
import { TestimonialsAutoOpen } from "@/components/testimonials/testimonials-auto-open";

export default function TestimonialsPage() {
  const homeHref = usePublicProfileNavHome();
  const pathname = usePathname();

  const needsRedirect =
    homeHref && homeHref !== "/profile" && !pathname.startsWith(homeHref + "/");
  if (needsRedirect) {
    return <PublicProfileSectionRedirect section="testimonials" />;
  }

  return (
    <>
      <Suspense fallback={null}>
        <TestimonialsAutoOpen />
      </Suspense>
      <TestimonialsShowcase />
    </>
  );
}

"use client";

import { PublicProfileSectionRedirect } from "@/components/public-profile-section-redirect";
import { usePublicProfileNavHome } from "@/hooks/use-public-profile-nav-home";
import { Suspense } from "react";
import { TestimonialsShowcase } from "@/components/sections/testimonials-showcase";
import { TestimonialsAutoOpen } from "@/components/testimonials/testimonials-auto-open";

export default function TestimonialsPage() {
  const homeHref = usePublicProfileNavHome();

  // Redirect visitors to slug-prefixed URL
  if (homeHref && homeHref !== "/profile") {
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

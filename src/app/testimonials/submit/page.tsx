import type { Metadata } from "next";
import { Suspense } from "react";
import { TestimonialsShowcase } from "@/components/sections/testimonials-showcase";
import { TestimonialsAutoOpen } from "@/components/testimonials/testimonials-auto-open";
import { buildTestimonialSubmitMetadata } from "@/lib/testimonials/social-metadata";

type PageProps = {
  searchParams: Promise<{ advisor?: string }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  return buildTestimonialSubmitMetadata(params.advisor);
}

/** Canonical share URL — opens public Give Testimonial form with rich link previews. */
export default function TestimonialSubmitPage() {
  return (
    <>
      <Suspense fallback={null}>
        <TestimonialsAutoOpen />
      </Suspense>
      <TestimonialsShowcase />
    </>
  );
}

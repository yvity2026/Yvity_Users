import { Suspense } from "react";
import { TestimonialsShowcase } from "@/components/sections/testimonials-showcase";
import { TestimonialsAutoOpen } from "@/components/testimonials/testimonials-auto-open";

export default function SlugTestimonialsPage() {
  return (
    <>
      <Suspense fallback={null}>
        <TestimonialsAutoOpen />
      </Suspense>
      <TestimonialsShowcase />
    </>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { TestimonialsShowcase } from "@/components/sections/testimonials-showcase";
import { TestimonialsAutoOpen } from "@/components/testimonials/testimonials-auto-open";

export const metadata: Metadata = { title: "Testimonials" };

export default function TestimonialsPage() {
  return (
    <>
      <Suspense fallback={null}>
        <TestimonialsAutoOpen />
      </Suspense>
      <TestimonialsShowcase />
    </>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTestimonialSubmit } from "@/lib/testimonial-submit-store";

/** Opens Give Testimonial on `/testimonials/submit` or `?submit=1` links. */
export function TestimonialsAutoOpen() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openGiveTestimonial } = useTestimonialSubmit();
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current) return;
    const onSubmitRoute = pathname === "/testimonials/submit";
    const onSubmitQuery = searchParams.get("submit") === "1";
    if (onSubmitRoute || onSubmitQuery) {
      opened.current = true;
      openGiveTestimonial();
    }
  }, [pathname, searchParams, openGiveTestimonial]);

  return null;
}

import { advisorProfile } from "@/lib/advisor-profile";
import type { TestimonialType } from "@/lib/sections/types";

export type GiveTestimonialDraft = {
  type: TestimonialType;
  fullName: string;
  mobile: string;
  profession: string;
  location: string;
  quote: string;
  mediaFile: File | null;
};

export const initialGiveTestimonialDraft = (): GiveTestimonialDraft => ({
  type: "text",
  fullName: "",
  mobile: "",
  profession: "",
  location: "",
  quote: "",
  mediaFile: null,
});

export function validateMobile(mobile: string): boolean {
  const digits = mobile.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export function validateGiveDetails(draft: GiveTestimonialDraft): string | null {
  if (!draft.fullName.trim() || draft.fullName.trim().length < 2) {
    return "Please enter your full name.";
  }
  if (!validateMobile(draft.mobile)) {
    return "Please enter a valid mobile number.";
  }
  return null;
}

export function validateGiveContent(draft: GiveTestimonialDraft): string | null {
  if (draft.type === "text") {
    if (!draft.quote.trim() || draft.quote.trim().length < 10) {
      return "Please write at least a few words for your testimonial.";
    }
  } else if (!draft.mediaFile) {
    return draft.type === "audio"
      ? "Please upload an audio recording."
      : "Please upload a video recording.";
  }
  return null;
}

export function formatTestimonialDate(d = new Date()): string {
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function formatMediaDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Advisor-specific public submit URL (path + query). */
/** Canonical short path; redirects to testimonials page with submit query. */
export function getTestimonialSubmitShortPath(advisorSlug = advisorProfile.slug): string {
  return `/testimonials/submit?advisor=${encodeURIComponent(advisorSlug)}`;
}

export function getTestimonialSubmitPath(advisorSlug = advisorProfile.slug): string {
  return `/testimonials?submit=1&advisor=${encodeURIComponent(advisorSlug)}`;
}

export function getTestimonialSubmitUrl(origin: string, advisorSlug = advisorProfile.slug): string {
  return `${origin.replace(/\/$/, "")}${getTestimonialSubmitShortPath(advisorSlug)}`;
}

/** Prefilled message when advisor shares testimonial link via WhatsApp. */
export function buildWhatsAppTestimonialShareMessage(
  link: string,
  advisor = advisorProfile,
): string {
  return `Hello,

This is ${advisor.name}, ${advisor.title}.

Thank you for trusting my services. I would appreciate your feedback. Please share your experience here:

${link}

Thank you.`;
}

/** Opens WhatsApp with pre-filled text (no specific recipient). */
export function whatsAppShareTextUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

import type { TestimonialService, TestimonialType } from "@/lib/sections/types";

export type GiveTestimonialDraft = {
  type: TestimonialType;
  service: TestimonialService | "";
  rating: number;
  fullName: string;
  mobile: string;
  profession: string;
  location: string;
  quote: string;
  mediaFile: File | null;
};

export const TESTIMONIAL_SERVICE_VALUES: TestimonialService[] = [
  "life",
  "health",
  "general",
  "mutual",
  "claim",
];

export function isTestimonialService(value: string): value is TestimonialService {
  return (TESTIMONIAL_SERVICE_VALUES as string[]).includes(value);
}

export function parseTestimonialRating(value: FormDataEntryValue | null): number | null {
  const parsed = Number(String(value ?? "").trim());
  if (!Number.isFinite(parsed)) return null;
  const rounded = Math.round(parsed);
  if (rounded < 1 || rounded > 5) return null;
  return rounded;
}

export const initialGiveTestimonialDraft = (): GiveTestimonialDraft => ({
  type: "text",
  service: "",
  rating: 5,
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
  if (!draft.service || !isTestimonialService(draft.service)) {
    return "Please select which service your testimonial is about.";
  }
  if (!Number.isInteger(draft.rating) || draft.rating < 1 || draft.rating > 5) {
    return "Please rate your experience from 1 to 5 stars.";
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
export function getTestimonialSubmitShortPath(advisorSlug: string): string {
  const slug = advisorSlug.trim();
  if (!slug) return "/testimonials/submit";
  return `/testimonials/submit?advisor=${encodeURIComponent(slug)}`;
}

export function getTestimonialSubmitPath(advisorSlug: string): string {
  const slug = advisorSlug.trim();
  if (!slug) return "/testimonials?submit=1";
  return `/testimonials?submit=1&advisor=${encodeURIComponent(slug)}`;
}

export function getTestimonialSubmitUrl(origin: string, advisorSlug: string): string {
  return `${origin.replace(/\/$/, "")}${getTestimonialSubmitShortPath(advisorSlug)}`;
}

export type TestimonialShareAdvisor = {
  name: string;
  title: string;
};

/** Prefilled message when advisor shares testimonial link via WhatsApp. */
export function buildWhatsAppTestimonialShareMessage(
  link: string,
  advisor: TestimonialShareAdvisor,
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

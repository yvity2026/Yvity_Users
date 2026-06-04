import type { LucideIcon } from "lucide-react";
import { Headphones, MessageSquare, Shield, Star, Users, Video } from "lucide-react";
import type { TestimonialService, TestimonialType } from "./types";

export const testimonialsPageCopy = {
  label: "Real Stories. Real People. Real Trust.",
  title: "Testimonials",
  description:
    "Hear from clients across Andhra Pradesh who trusted us with their financial protection and investments.",
};

export const testimonialTypeFilters: {
  id: TestimonialType | "all";
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "all", label: "All", icon: Users },
  { id: "text", label: "Text", icon: MessageSquare },
  { id: "audio", label: "Audio", icon: Headphones },
  { id: "video", label: "Video", icon: Video },
];

export const testimonialServiceOptions: { value: TestimonialService | "all"; label: string }[] = [
  { value: "all", label: "All Services" },
  { value: "life", label: "Life Insurance" },
  { value: "health", label: "Health Insurance" },
  { value: "general", label: "General Insurance" },
  { value: "mutual", label: "Mutual Funds" },
  { value: "claim", label: "Claim Support" },
];

export const testimonialServiceLabels: Record<TestimonialService, string> = {
  life: "Life Insurance",
  health: "Health Insurance",
  general: "General Insurance",
  mutual: "Mutual Funds",
  claim: "Claim Support",
};

export const testimonialTypeLabels: Record<TestimonialType, string> = {
  text: "Text",
  audio: "Audio",
  video: "Video",
};

export const testimonialTypeAccents: Record<
  TestimonialType,
  { text: string; chip: string; border: string }
> = {
  text: {
    text: "text-[oklch(0.82_0.13_205)]",
    chip: "bg-[oklch(0.82_0.13_205/0.12)]",
    border: "border-[oklch(0.82_0.13_205/0.35)]",
  },
  audio: {
    text: "text-[oklch(0.82_0.16_162)]",
    chip: "bg-[oklch(0.82_0.16_162/0.12)]",
    border: "border-[oklch(0.82_0.16_162/0.35)]",
  },
  video: {
    text: "text-[oklch(0.85_0.16_78)]",
    chip: "bg-[oklch(0.85_0.16_78/0.12)]",
    border: "border-[oklch(0.85_0.16_78/0.35)]",
  },
};

export const memberBadgeLabels: Record<"yvity-member" | "mobile-verified", string> = {
  "yvity-member": "YVITY Member",
  "mobile-verified": "Mobile Verified",
};

import type { CareerData } from "@/lib/career-types";
import type { GalleryItem } from "@/lib/gallery-types";
import type { AchievementItem, ServiceItem, TestimonialItem } from "@/lib/sections/types";

/** Empty career profile — no demo experiences or certifications. */
export const emptyCareerData: CareerData = {
  experiences: [],
  certifications: [],
  education: [],
};

export const EMPTY_SERVICES: ServiceItem[] = [];
export const EMPTY_ACHIEVEMENTS: AchievementItem[] = [];
export const EMPTY_TESTIMONIALS: TestimonialItem[] = [];
export const EMPTY_GALLERY: GalleryItem[] = [];

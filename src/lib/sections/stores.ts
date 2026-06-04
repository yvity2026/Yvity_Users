import { useMemo } from "react";
import { createSectionStore } from "@/lib/section-store";
import { defaultAchievements, defaultServices, defaultTestimonials } from "./defaults";
import { normalizeAchievements } from "./normalize-achievements";
import { normalizeServices } from "./normalize-services";
import { normalizeTestimonials } from "./normalize-testimonials";
import type { AchievementItem, ServiceItem, TestimonialItem } from "./types";

export function useServicesData(): [ServiceItem[], (data: ServiceItem[]) => void, boolean] {
  const [raw, setRaw, loading] = createSectionStore<ServiceItem[]>(
    "/api/services",
    defaultServices,
    "services-data-updated",
  )();
  const items = useMemo(() => normalizeServices(raw), [raw]);
  return [items, setRaw, loading];
}

export function useAchievementsData(): [
  AchievementItem[],
  (data: AchievementItem[]) => void,
  boolean,
] {
  const [raw, setRaw, loading] = createSectionStore<AchievementItem[]>(
    "/api/achievements",
    defaultAchievements,
    "achievements-data-updated",
  )();
  const items = useMemo(() => normalizeAchievements(raw), [raw]);
  return [items, setRaw, loading];
}

export function useTestimonialsData(): [
  TestimonialItem[],
  (data: TestimonialItem[]) => void,
  boolean,
] {
  const [raw, setRaw, loading] = createSectionStore<TestimonialItem[]>(
    "/api/testimonials",
    defaultTestimonials,
    "testimonials-data-updated",
  )();
  const items = useMemo(() => normalizeTestimonials(raw), [raw]);
  return [items, setRaw, loading];
}

export { uid } from "@/lib/section-store";

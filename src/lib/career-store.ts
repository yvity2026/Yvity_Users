"use client";

import { createSectionStore } from "@/lib/section-store";
import type { CareerData } from "./career-types";
import { emptyCareerData } from "./empty-data";

export { emptyCareerData as defaultCareerData } from "./empty-data";

const useCareerDataStore = createSectionStore<CareerData>(
  "/api/career",
  emptyCareerData,
  "career-data-updated",
);

export function useCareerData(): [CareerData, (d: CareerData) => void, boolean] {
  return useCareerDataStore();
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

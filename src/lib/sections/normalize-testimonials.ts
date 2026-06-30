import { defaultTestimonials } from "./defaults";
import type { TestimonialItem } from "./types";

function isTestimonialItem(value: unknown): value is TestimonialItem {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    "service" in value &&
    "profession" in value
  );
}

export function normalizeTestimonials(data: unknown): TestimonialItem[] {
  if (!Array.isArray(data) || data.length === 0) return defaultTestimonials;
  if (!isTestimonialItem(data[0])) return defaultTestimonials;
  return (data as TestimonialItem[]).map((item) => ({
    ...item,
    source: item.source ?? (item.memberBadge === "mobile-verified" ? "customer" : "advisor"),
  }));
}

export function isCustomerTestimonial(item: TestimonialItem): boolean {
  return item.source === "customer";
}

export function averageTestimonialRating(items: TestimonialItem[]): string {
  const rated = items.filter((item) => item.rating > 0);
  if (rated.length === 0) return "—";
  const avg = rated.reduce((sum, item) => sum + item.rating, 0) / rated.length;
  return avg.toFixed(1);
}

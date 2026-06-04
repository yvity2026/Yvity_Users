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
  if (items.length === 0) return "—";
  const avg = items.reduce((sum, item) => sum + item.rating, 0) / items.length;
  return avg.toFixed(1);
}

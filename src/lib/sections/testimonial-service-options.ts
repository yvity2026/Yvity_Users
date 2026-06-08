import { categoryHeadingFor } from "@/lib/sections/services-config";
import { testimonialServiceLabels } from "@/lib/sections/testimonials-config";
import type { ServiceCategory, ServiceItem, TestimonialService } from "@/lib/sections/types";
import { isServiceVisibleOnPublicProfile } from "@/lib/verification/defaults";

const CATEGORY_ORDER: ServiceCategory[] = ["life", "health", "general", "mutual"];

export type TestimonialServiceOption = {
  value: TestimonialService;
  label: string;
};

export type TestimonialServiceFilterOption = {
  value: TestimonialService | "all";
  label: string;
};

function uniqueRegisteredCategories(
  items: ServiceItem[],
  options: { publicOnly: boolean; profileApproved: boolean },
): ServiceCategory[] {
  const pool = options.publicOnly
    ? items.filter((item) => isServiceVisibleOnPublicProfile(item, options.profileApproved))
    : items;

  const seen = new Set<ServiceCategory>();
  const categories: ServiceCategory[] = [];

  for (const category of CATEGORY_ORDER) {
    if (!pool.some((item) => item.category === category)) continue;
    if (seen.has(category)) continue;
    seen.add(category);
    categories.push(category);
  }

  return categories;
}

/** Live service categories from the advisor's saved service cards. */
export function buildRegisteredTestimonialServiceOptions(
  items: ServiceItem[],
  options?: { profileApproved?: boolean; publicOnly?: boolean },
): TestimonialServiceOption[] {
  const profileApproved = options?.profileApproved ?? true;
  const publicOnly = options?.publicOnly ?? true;

  return uniqueRegisteredCategories(items, { publicOnly, profileApproved }).map((category) => ({
    value: category,
    label: categoryHeadingFor(category),
  }));
}

export function buildTestimonialServiceFilterOptions(
  items: ServiceItem[],
  options?: { profileApproved?: boolean; publicOnly?: boolean },
): TestimonialServiceFilterOption[] {
  const registered = buildRegisteredTestimonialServiceOptions(items, options);
  return [{ value: "all", label: "All Services" }, ...registered];
}

export function isRegisteredTestimonialService(
  service: string,
  items: ServiceItem[],
  options?: { profileApproved?: boolean; publicOnly?: boolean },
): service is TestimonialService {
  return buildRegisteredTestimonialServiceOptions(items, options).some((opt) => opt.value === service);
}

export function labelForTestimonialService(
  service: TestimonialService,
  items: ServiceItem[],
  options?: { profileApproved?: boolean; publicOnly?: boolean },
): string {
  const registered = buildRegisteredTestimonialServiceOptions(items, options);
  return (
    registered.find((opt) => opt.value === service)?.label ??
    testimonialServiceLabels[service] ??
    service
  );
}

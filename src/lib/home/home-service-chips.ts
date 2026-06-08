import { displayCompanyName } from "@/lib/sections/service-display";
import { categoryHeadingFor } from "@/lib/sections/services-config";
import type { ServiceCategory, ServiceItem } from "@/lib/sections/types";
import { isServiceVisibleOnPublicProfile } from "@/lib/verification/defaults";

export type HomeServiceChip = {
  id: string;
  category: ServiceCategory;
  label: string;
  subtitle: string;
  href: string;
};

const CATEGORY_ORDER: ServiceCategory[] = ["life", "health", "general", "mutual"];

/** Public home page chips derived from the advisor's saved services. */
export function buildHomeServiceChips(
  items: ServiceItem[],
  profileApproved: boolean,
): HomeServiceChip[] {
  const visible = items.filter((item) => isServiceVisibleOnPublicProfile(item, profileApproved));

  return [...visible]
    .sort((a, b) => {
      const order =
        CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
      if (order !== 0) return order;
      return a.id.localeCompare(b.id);
    })
    .map((item) => {
      const company = displayCompanyName(item.provider);
      const hasCompany = company !== "Enter your company name";

      return {
        id: item.id,
        category: item.category,
        label: categoryHeadingFor(item.category),
        subtitle: hasCompany ? company : "View details",
        href: "/services",
      };
    });
}

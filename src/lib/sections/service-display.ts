import { displayLicenseHolderLine } from "@/lib/advisor/service-license-holder";
import { resolveServiceExperience } from "@/lib/sections/service-experience";
import type { ServiceItem } from "@/lib/sections/types";
import { categoryHeadingFor } from "@/lib/sections/services-config";

const LEGACY_GENERIC_PROVIDER = "independent professional";

export function normalizeCompanyName(provider?: string | null): string {
  const trimmed = String(provider ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.toLowerCase() === LEGACY_GENERIC_PROVIDER) return "";
  return trimmed;
}

export function displayCompanyName(provider?: string | null): string {
  return normalizeCompanyName(provider) || "Enter your company name";
}

export function displayDesignation(item: Pick<ServiceItem, "roleLabel">): string {
  const designation = item.roleLabel?.trim();
  return designation || "Enter your designation";
}

/** Card title bar — category heading (Life / Health / General / Mutual). */
export function displayCategoryHeading(item: Pick<ServiceItem, "category">): string {
  return categoryHeadingFor(item.category);
}

export function displayExperience(item: Pick<ServiceItem, "experience" | "serviceStartDate">): string {
  const label = resolveServiceExperience(item);
  return label || "Enter your experience";
}

export function displayLicenseHolder(
  item: Pick<ServiceItem, "licenseHolder">,
  profileOwnerName?: string | null,
): string | null {
  return displayLicenseHolderLine(item, profileOwnerName);
}

export function formatMetricValue(value: number | string, placeholder: string): string {
  if (typeof value === "number") {
    return value === 0 ? "0" : String(value);
  }
  const trimmed = String(value ?? "").trim();
  if (!trimmed || trimmed === "0" || trimmed === "₹ 0") return placeholder;
  return trimmed;
}

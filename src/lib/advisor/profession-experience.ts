import { computeYearsSinceStartDate } from "@/lib/sections/service-experience";
import type { CareerData } from "@/lib/career-types";
import { resolveProfileHeroStat } from "@/lib/advisor/profile-hero-stat";
import type { ServiceItem } from "@/lib/sections/types";
import { isServiceVisibleOnPublicProfile } from "@/lib/verification/defaults";

/** Parse career `YYYY-MM` start into a local Date (1st of month). */
function parseCareerStartDate(value: string | undefined | null): Date | null {
  if (!value?.trim()) return null;
  const [yearText, monthText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  if (!year || !month || month < 1 || month > 12) return null;
  const start = new Date(year, month - 1, 1);
  if (Number.isNaN(start.getTime()) || start.getTime() > Date.now()) return null;
  return start;
}

/** Collect every profession start date from career journey entries. */
function collectCareerStartDates(career: CareerData): Date[] {
  const dates: Date[] = [];

  for (const experience of career.experiences) {
    const start = parseCareerStartDate(experience.start);
    if (start) dates.push(start);

    for (const subRole of experience.subRoles ?? []) {
      const subStart = parseCareerStartDate(subRole.start);
      if (subStart) dates.push(subStart);
    }
  }

  return dates;
}

/** Full years from the earliest career start date through today. */
export function computeCareerTotalExperienceYears(career: CareerData): number | null {
  const starts = collectCareerStartDates(career);
  if (starts.length === 0) return null;

  const earliest = starts.reduce((min, date) => (date.getTime() < min.getTime() ? date : min));
  const now = new Date();
  let years = now.getFullYear() - earliest.getFullYear();
  const monthDiff = now.getMonth() - earliest.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < earliest.getDate())) {
    years -= 1;
  }
  return Math.max(years, 0);
}

export function resolveCareerExperienceDisplay(career: CareerData): string {
  return formatProfileExperienceDisplay(computeCareerTotalExperienceYears(career));
}

/**
 * Highest tenure (full years) from service start dates in the pool.
 * Each service may have a different start date; we take the maximum.
 */
export function computeHighestExperienceYears(
  services: Pick<ServiceItem, "serviceStartDate" | "experience">[],
): number | null {
  let maxYears: number | null = null;

  for (const service of services) {
    const fromDate = computeYearsSinceStartDate(service.serviceStartDate);
    if (fromDate !== null) {
      maxYears = maxYears === null ? fromDate : Math.max(maxYears, fromDate);
      continue;
    }

    const fromLegacy = parseLegacyExperienceYears(service.experience);
    if (fromLegacy !== null) {
      maxYears = maxYears === null ? fromLegacy : Math.max(maxYears, fromLegacy);
    }
  }

  return maxYears;
}

/** Parses stored strings like `"7+ Years Experience"`. */
function parseLegacyExperienceYears(experience: string | undefined): number | null {
  const match = /(\d+)\+/.exec(experience ?? "");
  if (!match) return null;
  const years = Number(match[1]);
  return Number.isFinite(years) ? years : null;
}

/** Highest experience across all visible registration services. */
export function computeProfessionExperienceYears(
  services: ServiceItem[],
  profileApproved = true,
): number | null {
  const visible = services.filter((item) =>
    isServiceVisibleOnPublicProfile(item, profileApproved),
  );
  if (visible.length === 0) return null;
  return computeHighestExperienceYears(visible);
}

/** Short label for profile hero pills — e.g. `"7+"`, `"Less than 1 year"`. */
export function formatProfileExperienceDisplay(years: number | null): string {
  if (years === null) return "";
  if (years === 0) return "Less than 1 year";
  return `${years}+`;
}

/**
 * Insurance / financial services tenure for profile header, CTA chips, and
 * public advisor cards — highest full years among visible service cards.
 */
export function resolveServiceExperienceDisplay(
  services: ServiceItem[],
  profileApproved = true,
): string {
  return formatProfileExperienceDisplay(
    computeProfessionExperienceYears(services, profileApproved),
  );
}

/** @deprecated Prefer `resolveServiceExperienceDisplay` — name kept for imports. */
export function resolveProfileExperienceDisplay(
  services: ServiceItem[],
  profileApproved = true,
): string {
  return resolveServiceExperienceDisplay(services, profileApproved);
}

/** Total clients count summed across all services. */
export function computeHighestClientsCount(
  services: Pick<ServiceItem, "clients">[],
): number {
  let total = 0;
  for (const service of services) {
    const value = Number(service.clients ?? 0);
    if (Number.isFinite(value) && value > 0) total += value;
  }
  return total;
}

export function resolveProfileClientsCount(
  services: ServiceItem[],
  profileApproved = true,
): string {
  return resolveProfileHeroStat(services, profileApproved).value;
}

export { resolveProfileHeroStat, resolveProfileCapacityId } from "@/lib/advisor/profile-hero-stat";
export type { ProfileHeroStat } from "@/lib/advisor/profile-hero-stat";

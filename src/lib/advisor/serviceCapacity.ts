export const SERVICE_CAPACITY_OPTIONS = [
  {
    id: "individual_agent",
    label: "Individual",
    cardVariant: "agent",
    description:
      "Advisor, relationship manager, or anyone who works independently",
  },
  {
    id: "team_leader",
    label: "Team Leader",
    cardVariant: "leader",
    description: "Leads and manages a team of advisors",
  },
  {
    id: "firm_account",
    label: "Firm / Company",
    cardVariant: "firm",
    description: "Firm or company account that manages a team",
  },
] as const;

export type ServiceCapacityId = (typeof SERVICE_CAPACITY_OPTIONS)[number]["id"];

/** Only Individual is open for onboarding until pricing/product is finalised. */
export const CAPACITY_ONBOARDING_ENABLED_ID: ServiceCapacityId = "individual_agent";

const COMING_SOON_CAPACITY_IDS = new Set<ServiceCapacityId>(["team_leader", "firm_account"]);

export function isCapacityComingSoon(capacityId: string): boolean {
  const normalized = normalizeCapacityId(capacityId) as ServiceCapacityId;
  return COMING_SOON_CAPACITY_IDS.has(normalized);
}

export function isCapacityOnboardingEnabled(capacityId: string): boolean {
  return normalizeCapacityId(capacityId) === CAPACITY_ONBOARDING_ENABLED_ID;
}

/** New registrations always store Individual until team/firm pricing launches. */
export function capacityIdForOnboarding(_capacityId?: string): ServiceCapacityId {
  return CAPACITY_ONBOARDING_ENABLED_ID;
}

export function normalizeStoredCapacityId(capacityId: string | undefined): ServiceCapacityId {
  const normalized = normalizeCapacityId(capacityId ?? "") as ServiceCapacityId;
  if (!normalized) return CAPACITY_ONBOARDING_ENABLED_ID;
  return normalized;
}

/** Legacy setup values mapped to the current three account types. */
const LEGACY_CAPACITY_IDS: Record<string, string> = {
  insurance_agent: "individual_agent",
  employee: "individual_agent",
};

export function normalizeCapacityId(capacityId: string): string {
  const trimmed = String(capacityId ?? "").trim();
  if (!trimmed) return "";
  return LEGACY_CAPACITY_IDS[trimmed] ?? trimmed;
}

export function getCapacityOption(capacityId: string) {
  const normalized = normalizeCapacityId(capacityId);
  return SERVICE_CAPACITY_OPTIONS.find((item) => item.id === normalized);
}

export function getCapacityLabel(capacityId: string) {
  return getCapacityOption(capacityId)?.label ?? "";
}

export function encodeCapacityMetadata(capacityId: string) {
  const normalized = normalizeCapacityId(capacityId);
  if (!normalized) return null;
  return `role:${normalized}`;
}

export function decodeCapacityMetadata(keyServices: string[] = []) {
  const tag = (keyServices ?? []).find((item) => String(item).startsWith("role:"));
  if (!tag) return "";
  return normalizeCapacityId(String(tag).replace(/^role:/, ""));
}

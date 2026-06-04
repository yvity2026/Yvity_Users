export const SERVICE_CAPACITY_OPTIONS = [
  {
    id: "individual_agent",
    label: "Individual Agent",
    cardVariant: "agent",
    description: "Independent advisor selling policies on your own",
  },
  {
    id: "team_leader",
    label: "Team Leader",
    cardVariant: "leader",
    description: "Leads and manages a team of advisors",
  },
  {
    id: "firm_account",
    label: "Firm account",
    cardVariant: "firm",
    description: "Agency or firm account that manages a team",
  },
] as const;

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

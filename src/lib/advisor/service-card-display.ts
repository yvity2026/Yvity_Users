import {
  getCapacityLabel,
  normalizeCapacityId,
  type ServiceCapacityId,
} from "@/lib/advisor/serviceCapacity";

export type ServiceCardDisplay = {
  showClients: boolean;
  showClaims: boolean;
  showSumInsured: boolean;
  showClaimSettled: boolean;
  showClaimRatio: boolean;
  showTeamSize: boolean;
  showActiveAgents: boolean;
  showBranches: boolean;
  showAreas: boolean;
  showStatusMessage: boolean;
};

export const SERVICE_CARD_DISPLAY_OPTIONS: {
  key: keyof ServiceCardDisplay;
  label: string;
  hint?: string;
}[] = [
  { key: "showClients", label: "Clients served" },
  { key: "showClaims", label: "Claims handled" },
  { key: "showSumInsured", label: "Total sum insured" },
  { key: "showClaimSettled", label: "Total claim settled" },
  { key: "showClaimRatio", label: "Claim settlement ratio" },
  { key: "showTeamSize", label: "Team size", hint: "Team Leader / Firm" },
  { key: "showActiveAgents", label: "Active advisors", hint: "Team Leader / Firm" },
  { key: "showBranches", label: "Branches / offices", hint: "Firm / Company" },
  { key: "showAreas", label: "Areas / specializations" },
  { key: "showStatusMessage", label: "Status highlight message" },
];

export function defaultCardDisplayForCapacity(
  capacityId: string | undefined,
): ServiceCardDisplay {
  const cap = (normalizeCapacityId(capacityId ?? "") ||
    "individual_agent") as ServiceCapacityId;

  if (cap === "team_leader") {
    return {
      showClients: true,
      showClaims: false,
      showSumInsured: false,
      showClaimSettled: false,
      showClaimRatio: false,
      showTeamSize: true,
      showActiveAgents: true,
      showBranches: false,
      showAreas: true,
      showStatusMessage: true,
    };
  }

  if (cap === "firm_account") {
    return {
      showClients: true,
      showClaims: true,
      showSumInsured: true,
      showClaimSettled: true,
      showClaimRatio: false,
      showTeamSize: true,
      showActiveAgents: true,
      showBranches: false,
      showAreas: true,
      showStatusMessage: true,
    };
  }

  return {
    showClients: true,
    showClaims: true,
    showSumInsured: true,
    showClaimSettled: true,
    showClaimRatio: true,
    showTeamSize: false,
    showActiveAgents: false,
    showBranches: false,
    showAreas: true,
    showStatusMessage: true,
  };
}

export function mergeCardDisplay(
  capacityId: string | undefined,
  partial?: Partial<ServiceCardDisplay> | null,
): ServiceCardDisplay {
  return { ...defaultCardDisplayForCapacity(capacityId), ...(partial ?? {}) };
}

export function normalizeCardDisplay(raw: unknown): ServiceCardDisplay | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const row = raw as Partial<ServiceCardDisplay>;
  const keys = SERVICE_CARD_DISPLAY_OPTIONS.map((o) => o.key);
  const out: Partial<ServiceCardDisplay> = {};
  let any = false;
  for (const key of keys) {
    if (typeof row[key] === "boolean") {
      out[key] = row[key];
      any = true;
    }
  }
  return any ? (out as ServiceCardDisplay) : undefined;
}

export type ServiceCardMetricLabels = {
  clients: string;
  claims: string;
  claimRatio: string;
  teamSize: string;
  activeAgents: string;
  branches: string;
  capacityChip: string;
};

export function metricLabelsForCapacity(capacityId: string | undefined): ServiceCardMetricLabels {
  const cap = normalizeCapacityId(capacityId ?? "") || "individual_agent";

  if (cap === "team_leader") {
    return {
      clients: "Clients served (team)",
      claims: "Claims handled (team)",
      claimRatio: "Team claim settlement ratio",
      teamSize: "Team size",
      activeAgents: "Active advisors",
      branches: "Branches / offices",
      capacityChip: getCapacityLabel(cap) || "Team Leader",
    };
  }

  if (cap === "firm_account") {
    return {
      clients: "Clients served (firm)",
      claims: "Claims handled (firm)",
      claimRatio: "Firm claim settlement ratio",
      teamSize: "Team size",
      activeAgents: "Active advisors",
      branches: "Branches / offices",
      capacityChip: getCapacityLabel(cap) || "Firm / Company",
    };
  }

  return {
    clients: "Clients",
    claims: "Claims",
    claimRatio: "My claim settlement ratio",
    teamSize: "Team size",
    activeAgents: "Active advisors",
    branches: "Branches / offices",
    capacityChip: getCapacityLabel(cap) || "Individual",
  };
}

export function resolveServiceCapacityId(
  item: { capacityId?: string; roleLabel?: string },
  keyServices?: string[],
): ServiceCapacityId {
  const fromItem = normalizeCapacityId(item.capacityId ?? "");
  if (fromItem) return fromItem as ServiceCapacityId;
  if (keyServices?.length) {
    const tag = keyServices.find((s) => String(s).startsWith("role:"));
    if (tag) {
      const decoded = normalizeCapacityId(String(tag).replace(/^role:/, ""));
      if (decoded) return decoded as ServiceCapacityId;
    }
  }
  return "individual_agent";
}

function hasMetricNumber(value: number | undefined | null): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function hasMetricText(value: string | undefined | null): boolean {
  const trimmed = String(value ?? "").trim();
  if (!trimmed || trimmed === "0" || trimmed === "₹ 0" || trimmed === "—") return false;
  return true;
}

/** Public card — only show enabled fields that have a meaningful value. */
export function shouldShowServiceCardMetric(
  display: ServiceCardDisplay,
  key: keyof ServiceCardDisplay,
  item: {
    clients: number;
    claims: number;
    sumInsured: string;
    claimSettled: string;
    claimRatio: number;
    teamSize?: number;
    activeAgents?: number;
    branchCount?: number;
    statusMessage: string;
    areas: { label: string }[];
  },
): boolean {
  if (!display[key]) return false;

  switch (key) {
    case "showClients":
      return hasMetricNumber(item.clients);
    case "showClaims":
      return hasMetricNumber(item.claims);
    case "showSumInsured":
      return hasMetricText(item.sumInsured);
    case "showClaimSettled":
      return hasMetricText(item.claimSettled);
    case "showClaimRatio":
      return hasMetricNumber(item.claimRatio);
    case "showTeamSize":
      return hasMetricNumber(item.teamSize);
    case "showActiveAgents":
      return hasMetricNumber(item.activeAgents);
    case "showBranches":
      return hasMetricNumber(item.branchCount);
    case "showStatusMessage":
      return Boolean(item.statusMessage?.trim());
    case "showAreas":
      return item.areas.length > 0;
    default:
      return false;
  }
}

export function formatCountMetric(value: number | undefined): string {
  if (!hasMetricNumber(value)) return "0";
  return String(value);
}

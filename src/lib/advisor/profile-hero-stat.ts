import type { ServiceCapacityId } from "@/lib/advisor/serviceCapacity";
import type { ServiceItem } from "@/lib/sections/types";
import { isServiceVisibleOnPublicProfile } from "@/lib/verification/defaults";

export type ProfileHeroStat = {
  value: string;
  /** Short noun for hero pill — e.g. Clients, Advisors */
  label: string;
  /** CTA column caption under the number */
  ctaLabel: string;
  /** Highlight chip copy in CTA / banner */
  highlightLabel: string;
  capacityId: ServiceCapacityId;
};

const EMPTY_STAT: ProfileHeroStat = {
  value: "—",
  label: "Clients",
  ctaLabel: "Satisfied Clients",
  highlightLabel: "",
  capacityId: "individual_agent",
};

function visibleServices(services: ServiceItem[], profileApproved: boolean): ServiceItem[] {
  return services.filter((item) => isServiceVisibleOnPublicProfile(item, profileApproved));
}

function computeHighestClientsCount(services: Pick<ServiceItem, "clients">[]): number {
  let max = 0;
  for (const service of services) {
    const value = Number(service.clients ?? 0);
    if (Number.isFinite(value)) max = Math.max(max, value);
  }
  return max;
}

/** Profile-level capacity — firm / company wins over team leader over individual. */
export function resolveProfileCapacityId(
  services: ServiceItem[],
  profileApproved = true,
): ServiceCapacityId {
  const visible = visibleServices(services, profileApproved);
  let hasTeamLeader = false;

  for (const service of visible) {
    const cap = service.capacityId ?? "individual_agent";
    if (cap === "firm_account") return "firm_account";
    if (cap === "team_leader") hasTeamLeader = true;
  }

  return hasTeamLeader ? "team_leader" : "individual_agent";
}

function maxNumericField(
  services: ServiceItem[],
  field: "activeAgents" | "teamSize" | "branchCount",
): number {
  let max = 0;
  for (const service of services) {
    const value = Number(service[field] ?? 0);
    if (Number.isFinite(value)) max = Math.max(max, value);
  }
  return max;
}

function formatStatValue(value: number): string {
  if (value <= 0) return "—";
  return value.toLocaleString("en-IN");
}

function teamAdvisorCount(services: ServiceItem[]): number {
  return Math.max(maxNumericField(services, "activeAgents"), maxNumericField(services, "teamSize"));
}

/**
 * Primary profile stat for hero, CTA, and highlights — capacity-aware.
 * Team Leader / Firm → advisors in team (fallback: clients).
 * Individual → clients served.
 */
export function resolveProfileHeroStat(
  services: ServiceItem[],
  profileApproved = true,
): ProfileHeroStat {
  const visible = visibleServices(services, profileApproved);
  if (visible.length === 0) return EMPTY_STAT;

  const capacityId = resolveProfileCapacityId(services, profileApproved);

  if (capacityId === "team_leader") {
    const advisors = teamAdvisorCount(visible);
    if (advisors > 0) {
      const value = formatStatValue(advisors);
      return {
        value,
        label: "Advisors",
        ctaLabel: "Advisors in team",
        highlightLabel: `${value} advisors in team`,
        capacityId,
      };
    }
  }

  if (capacityId === "firm_account") {
    const advisors = teamAdvisorCount(visible);
    if (advisors > 0) {
      const value = formatStatValue(advisors);
      return {
        value,
        label: "Advisors",
        ctaLabel: "Firm / company advisors",
        highlightLabel: `${value} firm / company advisors`,
        capacityId,
      };
    }
    const branches = maxNumericField(visible, "branchCount");
    if (branches > 0) {
      const value = formatStatValue(branches);
      return {
        value,
        label: "Offices",
        ctaLabel: "Firm / company offices",
        highlightLabel: `${value} firm / company offices`,
        capacityId,
      };
    }
  }

  const clients = computeHighestClientsCount(visible);
  const value = formatStatValue(clients);
  if (value === "—") return { ...EMPTY_STAT, capacityId };

  const clientHighlight =
    capacityId === "firm_account"
      ? `${value} firm / company clients`
      : capacityId === "team_leader"
        ? `${value} team clients served`
        : `${value} satisfied clients`;

  return {
    value,
    label: "Clients",
    ctaLabel:
      capacityId === "firm_account"
        ? "Firm / company clients"
        : capacityId === "team_leader"
          ? "Team clients served"
          : "Satisfied Clients",
    highlightLabel: clientHighlight,
    capacityId,
  };
}

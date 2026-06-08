import { defaultServices } from "./defaults";
import type { ServiceItem } from "./types";
import { categoryHeadingFor } from "./services-config";
import { normalizeLicenseHolder } from "@/lib/advisor/service-license-holder";
import {
  defaultCardDisplayForCapacity,
  mergeCardDisplay,
} from "@/lib/advisor/service-card-display";
import { normalizeCapacityId, type ServiceCapacityId } from "@/lib/advisor/serviceCapacity";
import {
  emptyVerification,
  normalizeVerification,
  seededVerifiedRecord,
} from "@/lib/verification/defaults";

function isServiceLike(value: unknown): value is Partial<ServiceItem> {
  return (
    typeof value === "object" &&
    value !== null &&
    "category" in value &&
    "provider" in value &&
    "sumInsured" in value
  );
}

/**
 * Upgrades legacy flat service records to the insurance card schema and
 * ensures every service has a {@link VerificationRecord}.
 *
 * Legacy `verified: true` records become pre-verified records so existing demo
 * data continues to show on the public profile after the verification system
 * is enabled. New records default to `pending` (and stay hidden publicly until
 * an admin approves).
 */
export function normalizeServices(data: unknown): ServiceItem[] {
  const source: unknown[] = Array.isArray(data) && data.length > 0 ? data : defaultServices;

  return source.filter(isServiceLike).map((raw): ServiceItem => {
    const partial = raw as Partial<ServiceItem> & { verified?: boolean };
    const fallbackVerification = () =>
      partial.verified === false ? emptyVerification() : seededVerifiedRecord();
    const verification = partial.verification
      ? normalizeVerification(partial.verification, fallbackVerification)
      : fallbackVerification();

    const category = (partial.category ?? "life") as ServiceItem["category"];
    const capacityId = (normalizeCapacityId(partial.capacityId ?? "") ||
      "individual_agent") as ServiceCapacityId;

    return {
      id: partial.id ?? "",
      category,
      title: categoryHeadingFor(category),
      provider: partial.provider ?? "",
      experience: partial.experience ?? "",
      serviceStartDate:
        typeof partial.serviceStartDate === "string" && partial.serviceStartDate.trim()
          ? partial.serviceStartDate.trim()
          : undefined,
      roleLabel: partial.roleLabel ?? "",
      clients: partial.clients ?? 0,
      claims: partial.claims ?? 0,
      sumInsured: partial.sumInsured ?? "₹ 0",
      claimSettled: partial.claimSettled ?? "₹ 0",
      claimRatio: partial.claimRatio ?? 0,
      statusMessage: partial.statusMessage ?? "",
      statusCaption: partial.statusCaption ?? "",
      areas: Array.isArray(partial.areas) ? partial.areas : [],
      verified: verification.status === "verified",
      verification,
      companyLogoUrl: partial.companyLogoUrl,
      licenseHolder: normalizeLicenseHolder(partial.licenseHolder),
      capacityId,
      cardDisplay: mergeCardDisplay(capacityId, partial.cardDisplay),
      teamSize: typeof partial.teamSize === "number" ? partial.teamSize : undefined,
      activeAgents: typeof partial.activeAgents === "number" ? partial.activeAgents : undefined,
      branchCount: typeof partial.branchCount === "number" ? partial.branchCount : undefined,
      showDetailCard: partial.showDetailCard,
    };
  });
}

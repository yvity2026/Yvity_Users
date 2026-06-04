import { defaultServices } from "./defaults";
import type { ServiceItem } from "./types";
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

    return {
      id: partial.id ?? "",
      category: (partial.category ?? "life") as ServiceItem["category"],
      title: partial.title ?? "Untitled service",
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
      showDetailCard: partial.showDetailCard,
    };
  });
}

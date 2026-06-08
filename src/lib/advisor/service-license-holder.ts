import type { ServiceItem } from "@/lib/sections/types";

export const LICENSE_HOLDER_TYPES = ["self", "other"] as const;
export type LicenseHolderType = (typeof LICENSE_HOLDER_TYPES)[number];

export const LICENSE_HOLDER_RELATIONSHIPS = [
  { id: "wife", label: "Wife" },
  { id: "husband", label: "Husband" },
  { id: "father", label: "Father" },
  { id: "mother", label: "Mother" },
  { id: "sister", label: "Sister" },
  { id: "brother", label: "Brother" },
  { id: "friend", label: "Friend" },
  { id: "other", label: "Other" },
] as const;

export type LicenseHolderRelationship = (typeof LICENSE_HOLDER_RELATIONSHIPS)[number]["id"];

export type ServiceLicenseHolder = {
  type: LicenseHolderType;
  /** Full name as on IRDAI certificate (required when type is `other`). */
  name?: string;
  relationship?: LicenseHolderRelationship | string;
  consentUrl?: string;
  /** Admin use — not shown on public cards. */
  licenseNumber?: string;
};

export function relationshipLabel(id: string | undefined): string {
  if (!id) return "";
  return LICENSE_HOLDER_RELATIONSHIPS.find((row) => row.id === id)?.label ?? id;
}

export function defaultLicenseHolder(type: LicenseHolderType = "self"): ServiceLicenseHolder {
  return { type };
}

export function normalizeLicenseHolder(raw: unknown): ServiceLicenseHolder | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const row = raw as Partial<ServiceLicenseHolder>;
  const type = row.type === "other" ? "other" : row.type === "self" ? "self" : undefined;
  if (!type) return undefined;
  return {
    type,
    name: typeof row.name === "string" ? row.name.trim() : undefined,
    relationship:
      typeof row.relationship === "string" ? row.relationship.trim() : undefined,
    consentUrl: typeof row.consentUrl === "string" ? row.consentUrl.trim() : undefined,
    licenseNumber:
      typeof row.licenseNumber === "string" ? row.licenseNumber.trim() : undefined,
  };
}

/** Public card line — licence numbers are never shown here. */
export function displayLicenseHolderLine(
  item: Pick<ServiceItem, "licenseHolder">,
  profileOwnerName?: string | null,
): string | null {
  const holder = item.licenseHolder;
  if (!holder) return null;

  if (holder.type === "self") {
    const name = profileOwnerName?.trim() || holder.name?.trim();
    return name ? `Licence holder: ${name}` : null;
  }

  const name = holder.name?.trim();
  if (!name) return null;
  const rel = relationshipLabel(holder.relationship);
  return rel ? `Licence holder: ${name} (${rel})` : `Licence holder: ${name}`;
}

export const LICENSE_HOLDER_DECLARATION =
  "I declare that I have permission to conduct business using the licensed agent named above. I understand YVITY verifies documents in good faith and does not provide legal advice. I am responsible for compliance with IRDAI and insurer rules.";

export const LICENSE_HOLDER_CONSENT_HINT =
  "Download the standard consent form, read it carefully, and obtain wet signatures from the licence holder and yourself (both mandatory). Then upload a clear scan or photo (PDF/JPG, max 5 MB).";

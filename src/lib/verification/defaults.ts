import type { VerificationDocument, VerificationRecord, VerificationStatus } from "./types";

const nowIso = () => new Date().toISOString();

/** New record (pending, no documents). */
export function emptyVerification(): VerificationRecord {
  const ts = nowIso();
  return {
    status: "pending",
    documents: [],
    updatedAt: ts,
  };
}


/**
 * Critical field changed on an already-verified service — reset to pending
 * for re-approval. Keeps `reviewedAt` so the dashboard can distinguish
 * "never reviewed" from "was approved, now needs re-approval".
 */
export function markPendingReapproval(
  current: VerificationRecord,
  documents: VerificationDocument[],
): VerificationRecord {
  const ts = nowIso();
  return {
    ...current,
    status: "pending",
    documents,
    submittedAt: ts,
    rejectionReason: undefined,
    updatedAt: ts,
    // reviewedAt is intentionally preserved — signals "was previously reviewed"
  };
}

/** Advisor (re)submitted documents — moves status to pending. */
export function markSubmitted(
  current: VerificationRecord,
  documents: VerificationDocument[],
): VerificationRecord {
  const ts = nowIso();
  return {
    ...current,
    status: "pending",
    documents,
    submittedAt: ts,
    rejectionReason: undefined,
    updatedAt: ts,
  };
}

/** Admin approves. */
export function markVerified(
  current: VerificationRecord,
  reviewerNote?: string,
): VerificationRecord {
  const ts = nowIso();
  return {
    ...current,
    status: "verified",
    rejectionReason: undefined,
    reviewedAt: ts,
    updatedAt: ts,
    ...(reviewerNote ? { rejectionReason: undefined } : {}),
  };
}

/** Admin rejects with a reason. */
export function markRejected(current: VerificationRecord, reason: string): VerificationRecord {
  const ts = nowIso();
  return {
    ...current,
    status: "rejected",
    rejectionReason: reason,
    reviewedAt: ts,
    updatedAt: ts,
  };
}

/** Only verified entities should appear on the public profile. */
export function isPubliclyVisible(record: VerificationRecord | undefined): boolean {
  return record?.status === "verified";
}

/**
 * After admin approves the advisor profile, registration services (pending
 * verification) are shown on the public profile with registration data;
 * advisors can fill metrics via Edit in the dashboard.
 */
export function isServiceVisibleOnPublicProfile(
  item: { verification?: VerificationRecord },
  profileApproved: boolean,
): boolean {
  if (isPubliclyVisible(item.verification)) return true;
  if (item.verification?.status === "rejected") return false;
  return profileApproved;
}

/**
 * Convenience predicate used by entity types where verification is OPTIONAL
 * (career experiences, certifications, achievements). Returns `true` only
 * when an explicit record exists and its `status === "verified"`.
 *
 * Unlike {@link isPubliclyVisible}, callers should still render the entity
 * regardless — this just controls whether the "Verified by YVITY" badge
 * appears next to it.
 */
export function isYvityVerified(record: VerificationRecord | undefined): boolean {
  return record?.status === "verified";
}

/**
 * Whether to show "Verified by YVITY" on a service. Uses stored status when
 * present; when the advisor profile is approved, registration services that
 * were submitted with documents count as verified even before a backfill run.
 */
export function isServiceVerifiedByYvity(
  item: { verification?: VerificationRecord },
  profileApproved?: boolean,
): boolean {
  if (isYvityVerified(item.verification)) return true;
  if (!profileApproved) return false;
  if (item.verification?.status === "rejected") return false;
  const v = item.verification;
  if (!v) return false;
  return Boolean(v.submittedAt) || (v.documents?.length ?? 0) > 0;
}

/**
 * Normalises an optional verification record on a stored entity.
 *
 * - Returns `undefined` if the stored value isn't a non-empty object, so
 *   legacy entries without verification continue to behave as "no record".
 * - Otherwise delegates to {@link normalizeVerification} which validates
 *   status, documents, and timestamps.
 */
export function normalizeOptionalVerification(value: unknown): VerificationRecord | undefined {
  if (!value || typeof value !== "object") return undefined;
  if (Array.isArray(value)) return undefined;
  if (Object.keys(value as object).length === 0) return undefined;
  return normalizeVerification(value);
}

/** Normalises an unknown value into a {@link VerificationRecord}. */
export function normalizeVerification(
  value: unknown,
  fallback?: () => VerificationRecord,
): VerificationRecord {
  if (!value || typeof value !== "object") return (fallback ?? emptyVerification)();

  const raw = value as Partial<VerificationRecord>;
  const status: VerificationStatus =
    raw.status === "verified" || raw.status === "rejected" || raw.status === "pending"
      ? raw.status
      : "pending";

  const documents: VerificationDocument[] = Array.isArray(raw.documents)
    ? raw.documents
        .filter((d): d is VerificationDocument =>
          Boolean(d && typeof d === "object" && (d as VerificationDocument).url),
        )
        .map((d) => ({
          id: d.id,
          url: d.url,
          filename: d.filename ?? d.url.split("/").pop() ?? "document",
          mimeType: d.mimeType ?? "application/octet-stream",
          uploadedAt: d.uploadedAt ?? nowIso(),
          label: d.label,
        }))
    : [];

  const ts = nowIso();

  return {
    status,
    documents,
    submittedAt: typeof raw.submittedAt === "string" ? raw.submittedAt : undefined,
    reviewedAt: typeof raw.reviewedAt === "string" ? raw.reviewedAt : undefined,
    rejectionReason: typeof raw.rejectionReason === "string" ? raw.rejectionReason : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : ts,
  };
}

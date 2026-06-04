/**
 * Generic verification system shared across YVITY entity types.
 *
 * Today it is used by services. Tomorrow the same shape can power Career,
 * Education and Achievement verifications without changing the architecture —
 * only the entity that owns the `verification` field changes.
 */

export type VerificationStatus = "pending" | "verified" | "rejected";

export type VerificationDocument = {
  id: string;
  /** Public/signed URL — served by /api/verification/files/[filename]. */
  url: string;
  filename: string;
  mimeType: string;
  /** ISO date string. */
  uploadedAt: string;
  /** Optional document type label, e.g. "IRDA License", "ARN Certificate". */
  label?: string;
};

export type VerificationRecord = {
  status: VerificationStatus;
  documents: VerificationDocument[];
  /** ISO date — when the advisor (last) submitted documents. */
  submittedAt?: string;
  /** ISO date — when an admin (last) reviewed. */
  reviewedAt?: string;
  /** Free-form reviewer note shown to the advisor (when rejected). */
  rejectionReason?: string;
  /** ISO date — any meaningful state change (submit, resubmit, approve, reject). */
  updatedAt: string;
};

/** Entity kinds that can carry a `VerificationRecord` (used by the admin UI). */
export type VerificationEntityKind = "service" | "career" | "education" | "achievement";

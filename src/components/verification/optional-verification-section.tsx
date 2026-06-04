"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ShieldCheck, Info } from "lucide-react";
import { VerificationDocumentUpload } from "@/components/verification/verification-document-upload";
import { VerificationStatusBadge } from "@/components/verification/verification-status-badge";
import { emptyVerification, markSubmitted } from "@/lib/verification/defaults";
import type { VerificationDocument, VerificationRecord } from "@/lib/verification/types";
import { cn } from "@/lib/utils";

/**
 * Reusable verification panel for entities where YVITY verification is
 * OPTIONAL (Career experiences, Certifications, Achievements, etc.).
 *
 * UX rules:
 *   • If no documents have been uploaded → entity stays unverified silently.
 *   • If documents are uploaded / changed → status flips to "pending" and is
 *     submitted for admin review on save.
 *   • An already-verified record stays verified through metadata edits that
 *     don't change the document set.
 *   • Rejection reason is shown when applicable, with a clear path to
 *     re-upload and resubmit.
 *
 * The parent is responsible for:
 *   • Storing the {@link VerificationRecord | undefined} on its entity.
 *   • Calling {@link resolveVerificationOnSave} during its save flow to
 *     decide whether to flip status to "pending" or keep the existing record.
 */
export type OptionalVerificationSectionProps = {
  /** Current verification record (may be undefined for fresh entities). */
  value: VerificationRecord | undefined;
  /** Notify parent of every document change so it can persist the draft. */
  onChange: (next: { documents: VerificationDocument[]; dirty: boolean }) => void;
  /** Header copy shown above the upload widget. */
  title?: string;
  description?: string;
  /** Suggested document type labels for label prefill. */
  suggestedLabels?: string[];
};

export function OptionalVerificationSection({
  value,
  onChange,
  title = "YVITY Verification",
  description = "Optional. Upload supporting documents to earn a “Verified by YVITY” badge on your public profile. You can save and publish without verification.",
  suggestedLabels,
}: OptionalVerificationSectionProps) {
  const initialDocs = useMemo(() => value?.documents ?? [], [value?.documents]);

  const [pendingDocs, setPendingDocs] = useState<VerificationDocument[]>(initialDocs);
  const [dirty, setDirty] = useState(false);

  // Reset draft state when the parent swaps to a different record (e.g. when
  // the editor modal is opened for a different entry).
  useEffect(() => {
    setPendingDocs(initialDocs);
    setDirty(false);
  }, [initialDocs]);

  const status = value?.status ?? "pending";
  const hasRecord = Boolean(value);
  const hasDocs = pendingDocs.length > 0;

  const handleDocsChange = (next: VerificationDocument[]) => {
    setPendingDocs(next);
    setDirty(true);
    onChange({ documents: next, dirty: true });
  };

  return (
    <section className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 space-y-3">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.82_0.13_205/0.15)] text-[oklch(0.82_0.13_205)] ring-1 ring-[oklch(0.82_0.13_205/0.3)]">
            <ShieldCheck className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight">
              {title}
              <span className="ml-2 inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Optional
              </span>
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
        {hasRecord && <VerificationStatusBadge status={status} size="xs" />}
      </header>

      {suggestedLabels && suggestedLabels.length > 0 && (
        <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
          <Info className="size-3.5 shrink-0 mt-0.5" aria-hidden />
          <span>
            Recommended:{" "}
            <span className="text-foreground font-medium">{suggestedLabels.join(" · ")}</span>
          </span>
        </p>
      )}

      {status === "rejected" && value?.rejectionReason && (
        <div className="rounded-xl border border-[oklch(0.72_0.18_15/0.45)] bg-[oklch(0.72_0.18_15/0.12)] p-3 text-[12px] leading-relaxed">
          <p className="flex items-center gap-1.5 font-semibold text-[oklch(0.88_0.12_15)]">
            <AlertTriangle className="size-3.5" />
            Verification was rejected
          </p>
          <p className="mt-1 text-foreground/85">{value.rejectionReason}</p>
          <p className="mt-1 text-muted-foreground">
            Upload corrected documents below and save to resubmit for review.
          </p>
        </div>
      )}

      <VerificationDocumentUpload
        documents={pendingDocs}
        onChange={handleDocsChange}
        suggestedLabels={suggestedLabels}
      />

      <div
        className={cn(
          "rounded-lg border border-dashed px-3 py-2 text-[11px] leading-relaxed",
          hasDocs
            ? "border-[oklch(0.85_0.16_78/0.4)] bg-[oklch(0.85_0.16_78/0.06)] text-foreground/85"
            : "border-white/12 bg-white/[0.02] text-muted-foreground",
        )}
      >
        {hasDocs ? (
          <p>
            On save we'll submit{" "}
            <span className="font-semibold text-foreground">
              {pendingDocs.length} {pendingDocs.length === 1 ? "document" : "documents"}
            </span>{" "}
            for YVITY review. Status will update to{" "}
            <span className="font-semibold text-[oklch(0.92_0.14_78)]">Pending Verification</span>.
          </p>
        ) : (
          <p>
            No documents uploaded — saving will publish this entry{" "}
            <span className="font-medium text-foreground">without</span> a “Verified by YVITY”
            badge. You can come back any time to add documents.
          </p>
        )}
      </div>

      {/* Hidden state echo for the parent's resolve-on-save logic. */}
      <input type="hidden" data-verification-dirty={dirty} />
    </section>
  );
}

/**
 * Helper for parent editors. Computes the new verification record to persist
 * when the user clicks Save.
 *
 * Returns:
 *   - `undefined` when there's no existing record AND no new documents.
 *   - The existing record unchanged when nothing about the documents changed.
 *   - A fresh "pending" submission when documents were added/removed/edited,
 *     including resubmission after a rejection.
 */
export function resolveVerificationOnSave({
  current,
  pendingDocs,
  dirty,
}: {
  current: VerificationRecord | undefined;
  pendingDocs: VerificationDocument[];
  dirty: boolean;
}): VerificationRecord | undefined {
  // No existing record + no docs → keep unverified.
  if (!current && pendingDocs.length === 0) return undefined;

  if (!current) {
    // First-time submission: create an empty record and mark it submitted.
    return markSubmitted(emptyVerification(), pendingDocs);
  }

  const docsChanged =
    dirty ||
    pendingDocs.length !== (current.documents ?? []).length ||
    current.status === "rejected";

  if (!docsChanged) return current;

  // Resubmission with the new document set.
  return markSubmitted(current, pendingDocs);
}

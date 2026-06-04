"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, Info, Save, ShieldCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ServiceCompanyLogoUpload } from "@/components/sections/service-company-logo-upload";
import { VerificationDocumentUpload } from "@/components/verification/verification-document-upload";
import { VerificationStatusBadge } from "@/components/verification/verification-status-badge";
import { formatExperienceFromStart } from "@/lib/sections/service-experience";
import type { ServiceCategory, ServiceItem } from "@/lib/sections/types";
import { markSubmitted } from "@/lib/verification/defaults";
import { SERVICE_DOCUMENT_REQUIREMENTS } from "@/lib/verification/service-config";
import type { VerificationDocument } from "@/lib/verification/types";

type ServicesEditorModalProps = {
  item: ServiceItem;
  /**
   * True when the modal is editing a brand-new service that has not been
   * persisted yet. Used to swap the destructive footer button between
   * "Delete" (existing service) and "Discard" (unsaved draft).
   */
  isNew?: boolean;
  onClose: () => void;
  onSave: (item: ServiceItem) => void;
  onDelete: (id: string) => void;
};

const categories: { value: ServiceCategory; label: string }[] = [
  { value: "life", label: "Life Insurance" },
  { value: "health", label: "Health Insurance" },
  { value: "general", label: "General Insurance" },
  { value: "mutual", label: "Mutual Funds (banner only)" },
];

export function ServicesEditorModal({
  item,
  isNew = false,
  onClose,
  onSave,
  onDelete,
}: ServicesEditorModalProps) {
  const [draft, setDraft] = useState<ServiceItem>(item);
  const [areasText, setAreasText] = useState(item.areas.map((a) => a.label).join(", "));
  const [pendingDocs, setPendingDocs] = useState<VerificationDocument[]>(
    item.verification?.documents ?? [],
  );
  const [docsDirty, setDocsDirty] = useState(false);

  useEffect(() => {
    setDraft(item);
    setAreasText(item.areas.map((a) => a.label).join(", "));
    setPendingDocs(item.verification?.documents ?? []);
    setDocsDirty(false);
  }, [item]);

  const patch = useCallback(<K extends keyof ServiceItem>(key: K, value: ServiceItem[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  }, []);

  const showDetail = draft.category !== "mutual" && draft.showDetailCard !== false;

  const suggestedDocs = useMemo(
    () => SERVICE_DOCUMENT_REQUIREMENTS[draft.category] ?? [],
    [draft.category],
  );

  const verification = draft.verification;
  const canSubmit = pendingDocs.length > 0;
  const isResubmit = verification.status === "rejected";

  // Used as the `max` attribute on the date input — advisors can't start
  // a service in the future, and the native picker will clamp accordingly.
  const todayIso = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  // Live preview of the auto-calculated experience that will render on the
  // public card. `null` when no date / invalid date is entered.
  const computedExperience = useMemo(
    () => formatExperienceFromStart(draft.serviceStartDate),
    [draft.serviceStartDate],
  );

  const handleDocsChange = (next: VerificationDocument[]) => {
    setPendingDocs(next);
    setDocsDirty(true);
  };

  const save = () => {
    if (!canSubmit) return;
    const areas = areasText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((label) => ({ label }));

    // If the document set changed (added, removed, relabelled, or originally
    // rejected), treat this as a new submission and reset status to pending so
    // the admin can review the latest proof. Otherwise keep the existing
    // verification record so an already-verified service stays verified after
    // a metadata edit.
    const docsChanged =
      docsDirty ||
      verification.status !== "verified" ||
      pendingDocs.length !== (verification.documents ?? []).length;

    const nextVerification = docsChanged ? markSubmitted(verification, pendingDocs) : verification;

    onSave({
      ...draft,
      areas,
      showDetailCard: draft.category !== "mutual",
      verification: nextVerification,
      verified: nextVerification.status === "verified",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in">
      <button
        type="button"
        className="absolute inset-0 bg-background/95 backdrop-blur-xl"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg glass-strong rounded-3xl border border-white/15 p-6 md:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Service details
            </p>
            <p className="font-semibold">{draft.title || "Untitled"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-full glass border border-white/10"
          >
            <X className="size-4" />
          </button>
        </div>

        <Field label="Category">
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
            value={draft.category}
            onChange={(e) => {
              const category = e.target.value as ServiceCategory;
              patch("category", category);
              patch("showDetailCard", category !== "mutual");
            }}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Title">
          <Input value={draft.title} onChange={(e) => patch("title", e.target.value)} />
        </Field>
        <Field label="Company name">
          <Input
            placeholder="e.g. LIC of India"
            value={draft.provider}
            onChange={(e) => patch("provider", e.target.value)}
          />
        </Field>
        <Field label="Company logo (optional)">
          <ServiceCompanyLogoUpload
            logoUrl={draft.companyLogoUrl ?? ""}
            onLogoUrlChange={(url) => patch("companyLogoUrl", url)}
            companyName={draft.provider}
          />
          {draft.companyLogoUrl && (
            <button
              type="button"
              className="text-xs text-muted-foreground underline hover:text-foreground mt-2"
              onClick={() => patch("companyLogoUrl", "")}
            >
              Remove logo
            </button>
          )}
        </Field>
        <Field label="Service start date">
          <div className="relative">
            <CalendarDays
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="date"
              min="1950-01-01"
              max={todayIso}
              value={draft.serviceStartDate ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                patch("serviceStartDate", value ? value : undefined);
              }}
              className="pl-9"
              aria-describedby="service-start-date-hint"
            />
          </div>
          <p
            id="service-start-date-hint"
            className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground"
          >
            <Info className="size-3 shrink-0" aria-hidden />
            <span>
              Type the date or pick from the calendar. Experience is calculated automatically and
              shown on your service card.
            </span>
          </p>
          {computedExperience && (
            <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
              <CalendarDays className="size-3" aria-hidden />
              {computedExperience}
            </p>
          )}
        </Field>
        <Field label="Role label">
          <Input value={draft.roleLabel} onChange={(e) => patch("roleLabel", e.target.value)} />
        </Field>

        {showDetail && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Clients">
                <Input
                  type="number"
                  value={draft.clients}
                  onChange={(e) => patch("clients", Number(e.target.value) || 0)}
                />
              </Field>
              <Field label="Claims">
                <Input
                  type="number"
                  value={draft.claims}
                  onChange={(e) => patch("claims", Number(e.target.value) || 0)}
                />
              </Field>
            </div>
            <Field label="Total sum insured">
              <Input
                value={draft.sumInsured}
                onChange={(e) => patch("sumInsured", e.target.value)}
              />
            </Field>
            <Field label="Total claim settled">
              <Input
                value={draft.claimSettled}
                onChange={(e) => patch("claimSettled", e.target.value)}
              />
            </Field>
            <Field label="Claim ratio (%)">
              <Input
                type="number"
                value={draft.claimRatio}
                onChange={(e) => patch("claimRatio", Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Status message">
              <Input
                value={draft.statusMessage}
                onChange={(e) => patch("statusMessage", e.target.value)}
              />
            </Field>
            <Field label="Status caption">
              <Input
                value={draft.statusCaption}
                onChange={(e) => patch("statusCaption", e.target.value)}
              />
            </Field>
            <Field label="Areas (comma-separated)">
              <Textarea
                rows={2}
                placeholder="Term, Child Plan, Retirement, ULIP"
                value={areasText}
                onChange={(e) => setAreasText(e.target.value)}
              />
            </Field>
          </>
        )}

        <section className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 space-y-3">
          <header className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                <ShieldCheck className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight">
                  Verification Documents
                  <span className="ml-1 text-destructive">*</span>
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                  Required by YVITY. Service stays hidden from your public profile until an admin
                  approves the supporting documents.
                </p>
              </div>
            </div>
            <VerificationStatusBadge status={verification.status} size="xs" />
          </header>

          {suggestedDocs.length > 0 && (
            <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <Info className="size-3.5 shrink-0 mt-0.5" aria-hidden />
              <span>
                Recommended for this category:{" "}
                <span className="text-foreground font-medium">{suggestedDocs.join(" · ")}</span>
              </span>
            </p>
          )}

          {verification.status === "rejected" && verification.rejectionReason && (
            <div className="rounded-xl border border-[oklch(0.72_0.18_15/0.45)] bg-[oklch(0.72_0.18_15/0.12)] p-3 text-[12px] leading-relaxed">
              <p className="flex items-center gap-1.5 font-semibold text-[oklch(0.88_0.12_15)]">
                <AlertTriangle className="size-3.5" />
                Verification was rejected
              </p>
              <p className="mt-1 text-foreground/85">{verification.rejectionReason}</p>
              <p className="mt-1 text-muted-foreground">
                Upload corrected documents below and save to resubmit for review.
              </p>
            </div>
          )}

          <VerificationDocumentUpload
            documents={pendingDocs}
            onChange={handleDocsChange}
            suggestedLabels={suggestedDocs}
          />

          {!canSubmit && (
            <p className="text-[11px] text-destructive font-medium">
              At least one supporting document is required.
            </p>
          )}
        </section>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={save} disabled={!canSubmit} className="gap-2">
            <Save className="size-4" />
            {isResubmit ? "Save & Resubmit" : isNew ? "Save Service" : "Save"}
          </Button>
          <Button variant="destructive" onClick={() => onDelete(draft.id)} className="gap-2">
            <Trash2 className="size-4" /> {isNew ? "Discard" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

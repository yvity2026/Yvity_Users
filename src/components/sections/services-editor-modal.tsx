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
import { ServiceAccountTypePicker } from "@/components/advisor/service-account-type-picker";
import {
  defaultCardDisplayForCapacity,
  mergeCardDisplay,
  metricLabelsForCapacity,
  SERVICE_CARD_DISPLAY_OPTIONS,
} from "@/lib/advisor/service-card-display";
import {
  isCapacityComingSoon,
  normalizeStoredCapacityId,
  type ServiceCapacityId,
} from "@/lib/advisor/serviceCapacity";
import { formatExperienceFromStart } from "@/lib/sections/service-experience";
import { categoryHeadingFor } from "@/lib/sections/services-config";
import type { ServiceCategory, ServiceItem } from "@/lib/sections/types";
import { markPendingReapproval, markSubmitted } from "@/lib/verification/defaults";
import { SERVICE_DOCUMENT_REQUIREMENTS } from "@/lib/verification/service-config";
import type { VerificationDocument } from "@/lib/verification/types";
import { AnimatedModalShell } from "@/components/ui/animated-modal-shell";

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
  { value: "mutual", label: "Mutual Funds" },
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

  // Fields that require admin re-approval when changed on an already-verified service
  const wasVerified = !isNew && item.verification.status === "verified";
  const changedCriticalFields = useMemo(() => {
    if (!wasVerified) return [];
    const changed: string[] = [];
    if (draft.category !== item.category) changed.push("Service category");
    if ((draft.provider ?? "").trim() !== (item.provider ?? "").trim()) changed.push("Company name");
    if (draft.licenseHolder?.type !== item.licenseHolder?.type) changed.push("Licence holder");
    if ((draft.licenseHolder?.name ?? "").trim() !== (item.licenseHolder?.name ?? "").trim())
      changed.push("Licence holder name");
    return changed;
  }, [wasVerified, draft.category, draft.provider, draft.licenseHolder, item]);
  const needsReapproval = changedCriticalFields.length > 0;

  const suggestedDocs = useMemo(
    () => SERVICE_DOCUMENT_REQUIREMENTS[draft.category] ?? [],
    [draft.category],
  );

  const verification = draft.verification;
  const hasDocs = pendingDocs.length > 0;
  const isResubmit = verification.status === "rejected";
  // Save is always allowed; docs are only required for verification submission
  const canSubmit = true;

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

  const capacityId = (draft.capacityId ?? "individual_agent") as ServiceCapacityId;
  const capacityLocked = isCapacityComingSoon(capacityId);
  const cardDisplay = draft.cardDisplay ?? mergeCardDisplay(capacityId);
  const metricLabels = useMemo(() => metricLabelsForCapacity(capacityId), [capacityId]);

  const patchCardDisplay = (key: keyof typeof cardDisplay, value: boolean) => {
    setDraft((d) => ({
      ...d,
      cardDisplay: { ...mergeCardDisplay(d.capacityId ?? "individual_agent", d.cardDisplay), [key]: value },
    }));
  };

  const handleCapacityChange = (nextCapacity: ServiceCapacityId) => {
    if (isCapacityComingSoon(nextCapacity)) return;
    setDraft((d) => ({
      ...d,
      capacityId: nextCapacity,
      cardDisplay: defaultCardDisplayForCapacity(nextCapacity),
    }));
  };

  const handleDocsChange = (next: VerificationDocument[]) => {
    setPendingDocs(next);
    setDocsDirty(true);
  };

  const save = () => {
    const areas = areasText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((label) => ({ label }));

    // Critical field changed on a verified service → re-approval required.
    // Otherwise, if docs changed → new submission. Otherwise → keep record.
    const docsChanged =
      docsDirty ||
      (verification.status !== "verified" && hasDocs) ||
      pendingDocs.length !== (verification.documents ?? []).length;

    const nextVerification = needsReapproval
      ? markPendingReapproval(verification, pendingDocs)
      : docsChanged
        ? markSubmitted(verification, pendingDocs)
        : verification;

    onSave({
      ...draft,
      title: categoryHeadingFor(draft.category),
      areas,
      capacityId: normalizeStoredCapacityId(draft.capacityId),
      cardDisplay: mergeCardDisplay(capacityId, draft.cardDisplay),
      showDetailCard: draft.category !== "mutual",
      verification: nextVerification,
      verified: nextVerification.status === "verified",
    });
    onClose();
  };

  return (
    <AnimatedModalShell
      className="z-[100]"
      onClose={onClose}
      backdropTone="heavy"
      panelClassName="w-full sm:max-w-lg glass-strong rounded-t-3xl sm:rounded-3xl border border-white/15 shadow-2xl p-5 sm:p-6 md:p-8 space-y-4 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto"
    >
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Service details
            </p>
            <p className="font-semibold">{categoryHeadingFor(draft.category)}</p>
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
              patch("title", categoryHeadingFor(category));
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

        <Field label="Category heading">
          <Input
            readOnly
            value={categoryHeadingFor(draft.category)}
            className="bg-muted/40 text-muted-foreground"
          />
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
        <Field label="Designation">
          <Input
            placeholder="e.g. Chief Life Planner"
            value={draft.roleLabel}
            onChange={(e) => patch("roleLabel", e.target.value)}
          />
        </Field>

        {!showDetail && draft.category === "mutual" && (
          <div className="flex items-start gap-2.5 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-[12px] text-muted-foreground leading-relaxed">
            <Info className="size-3.5 shrink-0 mt-0.5 text-[oklch(0.82_0.13_205)]" />
            <span>
              <span className="font-medium text-foreground">Mutual Funds</span> appear in your services banner only — detailed metrics like clients, claims and areas are not available for this category.
            </span>
          </div>
        )}

        {showDetail && (
          <>
            <Field label="Account type">
              <ServiceAccountTypePicker
                variant="editor"
                value={capacityId}
                onChange={capacityLocked ? undefined : handleCapacityChange}
              />
            </Field>

            <section className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 space-y-3">
              <p className="text-sm font-semibold">Show on public service card</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Only selected fields with values appear on your profile. Defaults match your account
                type — uncheck anything that does not apply.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SERVICE_CARD_DISPLAY_OPTIONS.map((option) => (
                  <label
                    key={option.key}
                    className="flex cursor-pointer items-start gap-2 rounded-lg border border-white/10 px-2.5 py-2"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={cardDisplay[option.key]}
                      onChange={(e) => patchCardDisplay(option.key, e.target.checked)}
                    />
                    <span className="min-w-0">
                      <span className="block text-xs font-medium">{option.label}</span>
                      {option.hint ? (
                        <span className="block text-[10px] text-muted-foreground">{option.hint}</span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-2 gap-3">
              {cardDisplay.showClients ? (
                <Field label={metricLabels.clients}>
                  <Input
                    type="number"
                    min={0}
                    value={draft.clients}
                    onChange={(e) => patch("clients", Number(e.target.value) || 0)}
                  />
                </Field>
              ) : null}
              {cardDisplay.showClaims ? (
                <Field label={metricLabels.claims}>
                  <Input
                    type="number"
                    min={0}
                    value={draft.claims}
                    onChange={(e) => patch("claims", Number(e.target.value) || 0)}
                  />
                </Field>
              ) : null}
              {cardDisplay.showTeamSize ? (
                <Field label={metricLabels.teamSize}>
                  <Input
                    type="number"
                    min={0}
                    value={draft.teamSize ?? ""}
                    onChange={(e) =>
                      patch("teamSize", e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </Field>
              ) : null}
              {cardDisplay.showActiveAgents ? (
                <Field label={metricLabels.activeAgents}>
                  <Input
                    type="number"
                    min={0}
                    value={draft.activeAgents ?? ""}
                    onChange={(e) =>
                      patch("activeAgents", e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </Field>
              ) : null}
            </div>
            {cardDisplay.showBranches ? (
              <Field label={metricLabels.branches}>
                <Input
                  type="number"
                  min={0}
                  value={draft.branchCount ?? ""}
                  onChange={(e) =>
                    patch("branchCount", e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </Field>
            ) : null}
            {cardDisplay.showSumInsured ? (
              <Field label="Total sum insured">
                <Input
                  value={draft.sumInsured}
                  onChange={(e) => patch("sumInsured", e.target.value)}
                />
              </Field>
            ) : null}
            {cardDisplay.showClaimSettled ? (
              <Field label="Total claim settled">
                <Input
                  value={draft.claimSettled}
                  onChange={(e) => patch("claimSettled", e.target.value)}
                />
              </Field>
            ) : null}
            {cardDisplay.showClaimRatio ? (
              <Field label={`${metricLabels.claimRatio} (%)`}>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.claimRatio}
                  onChange={(e) => patch("claimRatio", Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                />
              </Field>
            ) : null}
            {cardDisplay.showStatusMessage ? (
              <>
                <Field label="Status message" hint="Short highlight shown with a tick on your card — e.g. 'MDRT Member', 'Award-winning advisor'">
                  <Input
                    placeholder="e.g. MDRT Member 2024"
                    value={draft.statusMessage}
                    onChange={(e) => patch("statusMessage", e.target.value)}
                  />
                </Field>
                <Field label="Status caption" hint="Optional detail below the message — e.g. 'Recognised since 2018'">
                  <Input
                    placeholder="e.g. Recognised since 2018"
                    value={draft.statusCaption}
                    onChange={(e) => patch("statusCaption", e.target.value)}
                  />
                </Field>
              </>
            ) : null}
            {cardDisplay.showAreas ? (
              <Field label="Areas (comma-separated)">
                <Textarea
                  rows={2}
                  placeholder={
                    draft.category === "life"
                      ? "Term, Child Plan, Retirement, ULIP"
                      : draft.category === "health"
                        ? "Critical Illness, Disability, Long-term Care, Group Health"
                        : draft.category === "general"
                          ? "Motor, Home, Liability, Travel, Fire"
                          : "Equity Funds, Debt Funds, Hybrid Funds, SIP"
                  }
                  value={areasText}
                  onChange={(e) => setAreasText(e.target.value)}
                />
              </Field>
            ) : null}
          </>
        )}

        {needsReapproval && (
          <div className="rounded-xl border border-[oklch(0.85_0.16_78/0.45)] bg-[oklch(0.85_0.16_78/0.1)] p-4 space-y-2">
            <p className="flex items-center gap-2 text-sm font-semibold text-[oklch(0.92_0.14_78)]">
              <AlertTriangle className="size-4 shrink-0" />
              Re-approval required
            </p>
            <p className="text-[12px] text-foreground/80 leading-relaxed">
              You changed:{" "}
              <span className="font-medium text-foreground">{changedCriticalFields.join(", ")}</span>.
              This service will be <span className="font-medium">hidden from your public profile</span> until
              admin reviews and re-approves the updated details.
            </p>
            <p className="text-[11px] text-muted-foreground">
              Upload updated verification documents below and save to submit for re-approval.
            </p>
          </div>
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

          {!hasDocs && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              Upload at least one document for YVITY verification. Without it, this service won&apos;t be verified on your public profile.
            </p>
          )}
        </section>

        {isResubmit && !needsReapproval && (
          <p className="text-[11px] text-muted-foreground leading-relaxed px-0.5">
            Saving will reset this service to <span className="font-medium text-foreground">pending</span> status — your updated documents will go back to admin for review.
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={save} disabled={!canSubmit} className="gap-2">
            <Save className="size-4" />
            {needsReapproval ? "Save & Submit for Re-approval" : isResubmit ? "Save & Resubmit" : isNew ? "Save Service" : "Save"}
          </Button>
          <Button variant="destructive" onClick={() => onDelete(draft.id)} className="gap-2">
            <Trash2 className="size-4" /> {isNew ? "Discard" : "Delete"}
          </Button>
        </div>
    </AnimatedModalShell>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground leading-relaxed">{hint}</p>}
    </div>
  );
}

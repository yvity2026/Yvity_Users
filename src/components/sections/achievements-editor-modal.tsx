"use client";

import { useCallback, useEffect, useState } from "react";
import { Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  OptionalVerificationSection,
  resolveVerificationOnSave,
} from "@/components/verification/optional-verification-section";
import { AnimatedModalShell } from "@/components/ui/animated-modal-shell";
import type {
  AchievementCategory,
  AchievementIconStyle,
  AchievementItem,
} from "@/lib/sections/types";
import type { VerificationDocument } from "@/lib/verification/types";

const categories: { value: AchievementCategory; label: string }[] = [
  { value: "life", label: "Life Insurance" },
  { value: "health", label: "Health Insurance" },
  { value: "education", label: "Education" },
  { value: "other", label: "Others" },
];

const iconStyles: { value: AchievementIconStyle; label: string }[] = [
  { value: "mdrt", label: "MDRT / COT / TOT" },
  { value: "trophy", label: "Trophy" },
  { value: "ribbon", label: "Ribbon / Award" },
  { value: "star", label: "Star" },
  { value: "heart", label: "Heart" },
  { value: "graduation", label: "Graduation" },
  { value: "users", label: "Team / Users" },
];

type AchievementsEditorModalProps = {
  item: AchievementItem;
  onClose: () => void;
  onSave: (item: AchievementItem) => void;
  onDelete: (id: string) => void;
};

export function AchievementsEditorModal({
  item,
  onClose,
  onSave,
  onDelete,
}: AchievementsEditorModalProps) {
  const [draft, setDraft] = useState<AchievementItem>(item);
  const [yearsText, setYearsText] = useState(item.years.join(", "));
  const [pendingDocs, setPendingDocs] = useState<VerificationDocument[]>(
    item.verification?.documents ?? [],
  );
  const [docsDirty, setDocsDirty] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    setDraft(item);
    setYearsText(item.years.join(", "));
    setPendingDocs(item.verification?.documents ?? []);
    setDocsDirty(false);
    setDirty(false);
  }, [item]);

  const patch = useCallback(
    <K extends keyof AchievementItem>(key: K, value: AchievementItem[K]) => {
      setDraft((d) => ({ ...d, [key]: value }));
      setDirty(true);
    },
    [],
  );

  const handleClose = () => {
    if (dirty || docsDirty) {
      setConfirmClose(true);
    } else {
      onClose();
    }
  };

  const save = () => {
    const years = yearsText
      .split(/[,•]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const nextVerification = resolveVerificationOnSave({
      current: draft.verification,
      pendingDocs,
      dirty: docsDirty,
    });
    onSave({
      ...draft,
      years,
      verification: nextVerification,
      verified: nextVerification?.status === "verified",
    });
    onClose();
  };

  return (
    <>
    <AnimatedModalShell
      className="z-[100]"
      onClose={handleClose}
      backdropTone="heavy"
      panelClassName="w-full sm:max-w-lg glass-strong rounded-t-3xl sm:rounded-3xl border border-white/15 shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[90vh]"
    >
        <div className="overflow-y-auto flex-1 min-h-0 p-5 sm:p-6 md:p-8 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Edit achievement
            </p>
            <p className="font-semibold">{draft.title || "Untitled"}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex size-9 items-center justify-center rounded-full glass border border-white/10"
          >
            <X className="size-4" />
          </button>
        </div>

        <Field label="Category">
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
            value={draft.category}
            onChange={(e) => patch("category", e.target.value as AchievementCategory)}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Icon style">
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
            value={draft.iconStyle}
            onChange={(e) => patch("iconStyle", e.target.value as AchievementIconStyle)}
          >
            {iconStyles.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Title">
          <Input value={draft.title} onChange={(e) => patch("title", e.target.value)} />
        </Field>
        <Field label="Subtitle">
          <Input value={draft.subtitle} onChange={(e) => patch("subtitle", e.target.value)} />
        </Field>
        <Field label="Achieved count">
          <Input
            type="number"
            min={1}
            value={draft.achievedCount}
            onChange={(e) => patch("achievedCount", Math.max(1, Number(e.target.value) || 1))}
          />
        </Field>
        <Field label="Years (comma-separated)">
          <Input
            placeholder="2021, 2022, 2023"
            value={yearsText}
            onChange={(e) => { setYearsText(e.target.value); setDirty(true); }}
          />
        </Field>
        <Field label="Description">
          <Textarea
            rows={4}
            value={draft.description}
            onChange={(e) => patch("description", e.target.value)}
          />
        </Field>

        <OptionalVerificationSection
          value={draft.verification}
          onChange={({ documents, dirty }) => {
            setPendingDocs(documents);
            setDocsDirty(dirty);
          }}
          description="Optional. Upload award certificates, MDRT/COT/TOT membership proofs, or company recognition letters to earn a “Verified by YVITY” badge on this achievement. You can publish without verification."
          suggestedLabels={["Award Certificate", "Recognition Letter", "Membership Proof"]}
        />

        </div>{/* end scroll body */}
        <div className="flex flex-wrap gap-2 p-5 sm:p-6 border-t border-white/10 shrink-0 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <Button onClick={save} className="gap-2">
            <Save className="size-4" /> Save
          </Button>
          <Button variant="destructive" onClick={() => { onDelete(draft.id); onClose(); }} className="gap-2">
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
    </AnimatedModalShell>
    <ConfirmDialog
      open={confirmClose}
      onOpenChange={setConfirmClose}
      title="Discard changes?"
      description="You have unsaved changes. Are you sure you want to close?"
      confirmLabel="Discard"
      tone="destructive"
      onConfirm={onClose}
    />
    </>
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

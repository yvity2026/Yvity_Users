"use client";

import { useEffect, useState } from "react";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { durationLabel } from "@/lib/duration";
import type { Certification, Education, Experience, RoleSubItem } from "@/lib/career-types";
import { uid } from "@/lib/career-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function ModalShell({
  title,
  onClose,
  onSave,
  children,
}: {
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 pb-[3.75rem] sm:pb-0 sm:p-4 animate-in fade-in">
      <button
        type="button"
        className="absolute inset-0 bg-background/95 backdrop-blur-xl"
        onClick={onClose}
      />
      <div className="relative z-10 w-full sm:max-w-lg max-h-[calc(92dvh-3.75rem)] sm:max-h-[90vh] flex flex-col glass-strong rounded-t-2xl sm:rounded-2xl border border-white/15 shadow-2xl">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10 shrink-0">
          <p className="font-semibold text-sm">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-full glass border border-white/10"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">{children}</div>
        <div className="flex gap-2 p-4 border-t border-white/10 shrink-0">
          <Button onClick={onSave} className="gap-2 flex-1 sm:flex-none">
            <Save className="size-4" /> Save
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ExperienceEditModal({
  item,
  onClose,
  onSave,
}: {
  item: Experience;
  onClose: () => void;
  onSave: (item: Experience) => void;
}) {
  const [draft, setDraft] = useState(item);
  useEffect(() => { setDraft(item); }, [item]);
  const patch = (p: Partial<Experience>) => setDraft((d) => ({ ...d, ...p }));

  return (
    <ModalShell title="Edit experience" onClose={onClose} onSave={() => onSave(draft)}>
      <p className="text-xs text-muted-foreground">
        Duration:{" "}
        <span className="text-foreground font-medium">
          {durationLabel(draft.start, draft.end) || "—"}
        </span>
      </p>
      <Field label="Role">
        <Input value={draft.role} onChange={(e) => patch({ role: e.target.value })} />
      </Field>
      <Field label="Company">
        <Input value={draft.company} onChange={(e) => patch({ company: e.target.value })} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Category">
          <Input value={draft.category} onChange={(e) => patch({ category: e.target.value })} />
        </Field>
        <Field label="Location">
          <Input value={draft.location} onChange={(e) => patch({ location: e.target.value })} />
        </Field>
        <Field label="Start">
          <Input
            type="month"
            value={draft.start}
            onChange={(e) => patch({ start: e.target.value })}
          />
        </Field>
        <Field label="End (empty = Present)">
          <Input type="month" value={draft.end} onChange={(e) => patch({ end: e.target.value })} />
        </Field>
      </div>
      <Field label="Highlights (one per line)">
        <Textarea
          rows={4}
          value={draft.bullets.join("\n")}
          onChange={(e) => patch({ bullets: e.target.value.split("\n") })}
        />
      </Field>
      <SubRolesEditor
        subRoles={draft.subRoles || []}
        onChange={(subRoles) => patch({ subRoles })}
      />
    </ModalShell>
  );
}

function SubRolesEditor({
  subRoles,
  onChange,
}: {
  subRoles: RoleSubItem[];
  onChange: (s: RoleSubItem[]) => void;
}) {
  const update = (idx: number, p: Partial<RoleSubItem>) =>
    onChange(subRoles.map((s, i) => (i === idx ? { ...s, ...p } : s)));
  const remove = (idx: number) => onChange(subRoles.filter((_, i) => i !== idx));
  const add = () =>
    onChange([...subRoles, { id: uid("sr"), title: "", start: "", end: "", bullets: [""] }]);

  return (
    <div className="rounded-xl border border-dashed border-white/15 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Sub-roles</p>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="size-3.5" /> Add
        </Button>
      </div>
      {subRoles.map((s, i) => (
        <div key={s.id} className="rounded-lg bg-white/[0.04] p-3 space-y-2">
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => remove(i)}
            >
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </div>
          <Input
            placeholder="Title"
            value={s.title}
            onChange={(e) => update(i, { title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="month"
              value={s.start}
              onChange={(e) => update(i, { start: e.target.value })}
            />
            <Input
              type="month"
              value={s.end}
              onChange={(e) => update(i, { end: e.target.value })}
            />
          </div>
          <Textarea
            rows={2}
            value={s.bullets.join("\n")}
            onChange={(e) => update(i, { bullets: e.target.value.split("\n") })}
          />
        </div>
      ))}
    </div>
  );
}

export function CertificationEditModal({
  item,
  onClose,
  onSave,
}: {
  item: Certification;
  onClose: () => void;
  onSave: (item: Certification) => void;
}) {
  const [draft, setDraft] = useState(item);
  useEffect(() => { setDraft(item); }, [item]);
  const patch = (p: Partial<Certification>) => setDraft((d) => ({ ...d, ...p }));

  return (
    <ModalShell title="Edit certification" onClose={onClose} onSave={() => onSave(draft)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Name">
          <Input value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
        </Field>
        <Field label="Issuer">
          <Input value={draft.issuer} onChange={(e) => patch({ issuer: e.target.value })} />
        </Field>
        <Field label="Year">
          <Input value={draft.year} onChange={(e) => patch({ year: e.target.value })} />
        </Field>
        <Field label="Certificate ID">
          <Input
            value={draft.certificateId || ""}
            onChange={(e) => patch({ certificateId: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Bullets (one per line)">
        <Textarea
          rows={3}
          value={draft.bullets.join("\n")}
          onChange={(e) => patch({ bullets: e.target.value.split("\n") })}
        />
      </Field>
    </ModalShell>
  );
}

export function EducationEditModal({
  item,
  onClose,
  onSave,
}: {
  item: Education;
  onClose: () => void;
  onSave: (item: Education) => void;
}) {
  const [draft, setDraft] = useState(item);
  useEffect(() => setDraft(item), [item]);
  const patch = (p: Partial<Education>) => setDraft((d) => ({ ...d, ...p }));

  return (
    <ModalShell title="Edit education" onClose={onClose} onSave={() => onSave(draft)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Degree">
          <Input value={draft.degree} onChange={(e) => patch({ degree: e.target.value })} />
        </Field>
        <Field label="Specialization">
          <Input
            value={draft.specialization || ""}
            onChange={(e) => patch({ specialization: e.target.value })}
          />
        </Field>
        <Field label="Institution">
          <Input
            value={draft.institution}
            onChange={(e) => patch({ institution: e.target.value })}
          />
        </Field>
        <Field label="Location">
          <Input value={draft.location} onChange={(e) => patch({ location: e.target.value })} />
        </Field>
        <Field label="Year">
          <Input value={draft.year} onChange={(e) => patch({ year: e.target.value })} />
        </Field>
      </div>
    </ModalShell>
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

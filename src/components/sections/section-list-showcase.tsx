"use client";

import { useCallback, useState } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionAdvisorCta } from "@/components/sections/section-advisor-cta";
import { SectionProfileBanner } from "@/components/sections/section-profile-banner";
import { cn } from "@/lib/utils";
import { AnimatedModalShell } from "@/components/ui/animated-modal-shell";
import { uid } from "@/lib/section-store";

type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number";
  placeholder?: string;
};

type SectionListShowcaseProps<T extends { id: string }> = {
  title: string;
  subtitle: string;
  gradientWord: string;
  badge: string;
  items: T[];
  loading: boolean;
  editable?: boolean;
  embedded?: boolean;
  showProfileBanner?: boolean;
  showAdvisorCta?: boolean;
  addLabel: string;
  emptyLabel: string;
  fields: FieldDef[];
  renderCard: (item: T) => React.ReactNode;
  createItem: () => T;
  onSaveAll: (items: T[]) => void;
  getCardTitle: (item: T) => string;
};

export function SectionListShowcase<T extends { id: string }>({
  title,
  subtitle,
  gradientWord,
  badge,
  items,
  loading,
  editable = false,
  embedded = false,
  showProfileBanner = false,
  showAdvisorCta,
  addLabel,
  emptyLabel,
  fields,
  renderCard,
  createItem,
  onSaveAll,
  getCardTitle,
}: SectionListShowcaseProps<T>) {
  const showCta = showAdvisorCta ?? !embedded;
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<T | null>(null);

  const openEdit = (item: T) => {
    setEditId(item.id);
    setDraft({ ...item });
  };

  const closeEdit = () => {
    setEditId(null);
    setDraft(null);
  };

  const addItem = () => {
    const item = createItem();
    onSaveAll([...items, item]);
    openEdit(item);
  };

  const saveDraft = () => {
    if (!draft) return;
    const exists = items.some((i) => i.id === draft.id);
    onSaveAll(exists ? items.map((i) => (i.id === draft.id ? draft : i)) : [...items, draft]);
    closeEdit();
  };

  const deleteItem = (id: string) => {
    if (!confirm("Delete this item?")) return;
    onSaveAll(items.filter((i) => i.id !== id));
    closeEdit();
  };

  const patch = useCallback((key: string, value: string | number) => {
    setDraft((d) => (d ? ({ ...d, [key]: value } as T) : d));
  }, []);

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-sm text-muted-foreground",
          embedded ? "min-h-[240px]" : "min-h-[40vh]",
        )}
      >
        Loading…
      </div>
    );
  }

  return (
    <div className={cn("relative", embedded ? "" : "min-h-[calc(100vh-4rem)]")}>
      {!embedded && (
        <header className="mx-auto max-w-6xl px-4 md:px-6 pt-8 md:pt-14 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {badge}
          </div>
          <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            {title} <span className="text-gradient-brand">{gradientWord}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-muted-foreground">
            {subtitle}
          </p>
        </header>
      )}

      <div className={cn("mx-auto max-w-6xl px-4 md:px-6", embedded ? "py-2" : "pb-2")}>
        {showProfileBanner && !embedded && <SectionProfileBanner className="mb-6 sm:mb-8" />}
        {embedded && editable && (
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-4">
            Manage section · saves to public profile
          </p>
        )}

        <div className="sticky top-16 z-40 mb-6 glass-strong rounded-2xl border border-white/10 p-2 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground px-2">
            <span className="text-foreground font-semibold">{items.length}</span> items
          </p>
          {editable && (
            <Button onClick={addItem} size="sm" className="gap-1.5 rounded-xl">
              <Plus className="size-4" /> {addLabel}
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="glass-strong rounded-3xl border border-dashed border-white/15 p-12 text-center text-muted-foreground">
            {emptyLabel}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => editable && openEdit(item)}
                className={cn(
                  "text-left glass-strong rounded-3xl border border-white/10 p-6 transition hover:border-white/20",
                  editable && "cursor-pointer hover:-translate-y-0.5",
                  !editable && "cursor-default",
                )}
              >
                {renderCard(item)}
                {editable && (
                  <p className="mt-3 text-[11px] uppercase tracking-[0.16em] font-semibold text-[oklch(0.82_0.13_205)]">
                    Click to edit
                  </p>
                )}
              </button>
            ))}
          </div>
        )}

        {showCta && <SectionAdvisorCta className="mt-8 sm:mt-10" />}
      </div>

      {editable && draft && editId && (
        <AnimatedModalShell
          className="z-[100]"
          onClose={closeEdit}
          backdropTone="heavy"
          panelClassName="w-full sm:max-w-lg glass-strong rounded-t-3xl sm:rounded-3xl border border-white/15 shadow-2xl p-5 sm:p-6 md:p-8 space-y-4 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto"
        >
            <EditorHeader title={getCardTitle(draft)} onClose={closeEdit} />
            {fields.map((f) => (
              <Field key={f.key} label={f.label}>
                {f.type === "textarea" ? (
                  <Textarea
                    rows={3}
                    value={String((draft as Record<string, unknown>)[f.key] ?? "")}
                    onChange={(e) => patch(f.key, e.target.value)}
                  />
                ) : (
                  <Input
                    type={f.type === "number" ? "number" : "text"}
                    placeholder={f.placeholder}
                    value={String((draft as Record<string, unknown>)[f.key] ?? "")}
                    onChange={(e) =>
                      patch(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)
                    }
                  />
                )}
              </Field>
            ))}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={saveDraft} className="gap-2">
                <Save className="size-4" /> Save
              </Button>
              <Button variant="destructive" onClick={() => deleteItem(draft.id)} className="gap-2">
                <Trash2 className="size-4" /> Delete
              </Button>
            </div>
        </AnimatedModalShell>
      )}
    </div>
  );
}

function EditorHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Edit item</p>
        <p className="font-semibold">{title}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex size-9 items-center justify-center rounded-full glass border border-white/10"
      >
        <X className="size-4" />
      </button>
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

export { uid } from "@/lib/section-store";

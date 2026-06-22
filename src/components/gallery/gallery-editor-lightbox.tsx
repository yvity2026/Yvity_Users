"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Save, Trash2, X } from "lucide-react";
import { GalleryCategoryPicker } from "@/components/gallery/gallery-category-picker";
import { GalleryImageUpload } from "@/components/gallery/gallery-image-upload";
import { formatGalleryCategory } from "@/components/gallery/gallery-item-meta";
import type { GalleryItem, GalleryLayout } from "@/lib/gallery-types";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSave: (item: GalleryItem) => void;
  onDelete: (id: string) => void;
};

const layoutOptions: { value: GalleryLayout; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "wide", label: "Wide" },
  { value: "tall", label: "Tall" },
  { value: "hero", label: "Hero spotlight" },
];

export function GalleryEditorLightbox(props: Props) {
  const { items, index, onClose, onPrev, onNext, onSave, onDelete } = props;
  const source = items[index];
  const [draft, setDraft] = useState<GalleryItem | null>(source ?? null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (source) setDraft(source);
  }, [source]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onNext, onPrev]);

  if (!draft) return null;

  const patch = (p: Partial<GalleryItem>) => setDraft((d) => (d ? { ...d, ...p } : d));
  const isLocal = draft.imageUrl.startsWith("/api/");

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <button
        type="button"
        className="absolute inset-0 bg-background/95 backdrop-blur-xl"
        onClick={onClose}
        aria-label="Close editor"
      />

      <div className="relative z-10 w-full sm:max-w-lg md:max-w-3xl lg:max-w-4xl max-h-[100dvh] sm:max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 pb-[env(safe-area-inset-bottom)] sm:pb-0">
        <div className="glass-strong rounded-t-2xl sm:rounded-2xl border border-white/15 shadow-2xl shadow-black/50 flex flex-col max-h-[inherit] overflow-hidden">
          {/* Header — compact */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10 shrink-0">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Edit moment
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {index + 1} of {items.length} · {formatGalleryCategory(draft.category)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full glass border border-white/10"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 min-h-0">
            <div className="flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-0">
              {/* Preview column */}
              <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[280px] lg:min-h-[320px] w-full bg-black/40 border-b md:border-b-0 md:border-r border-white/10 shrink-0">
                {draft.imageUrl ? (
                  <Image
                    src={draft.imageUrl}
                    alt={draft.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                    unoptimized={isLocal}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground p-4 text-center">
                    Upload an image or paste a URL
                  </div>
                )}
              </div>

              {/* Form column */}
              <div className="p-4 sm:p-5 space-y-4">
                <GalleryImageUpload
                  imageUrl={draft.imageUrl}
                  onImageUrlChange={(imageUrl) => patch({ imageUrl })}
                  title={draft.title}
                  showPreview={false}
                />

                <GalleryCategoryPicker
                  value={draft.category}
                  onChange={(category) => patch({ category })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Title">
                    <Input value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
                  </Field>
                  <Field label="Date">
                    <Input
                      value={draft.date}
                      onChange={(e) => patch({ date: e.target.value })}
                      placeholder="Apr 2024"
                    />
                  </Field>
                  <Field label="Location">
                    <Input
                      value={draft.location ?? ""}
                      onChange={(e) => patch({ location: e.target.value })}
                    />
                  </Field>
                  <Field label="Grid layout">
                    <select
                      value={draft.layout ?? "default"}
                      onChange={(e) => patch({ layout: e.target.value as GalleryLayout })}
                      className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
                    >
                      {layoutOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Caption">
                  <Textarea
                    rows={3}
                    value={draft.caption}
                    onChange={(e) => patch({ caption: e.target.value })}
                  />
                </Field>

                <div className="space-y-1">
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={!!draft.featured}
                      onChange={(e) => patch({ featured: e.target.checked })}
                    />
                    Featured spotlight
                  </label>
                  <p className="text-[10px] text-muted-foreground pl-6">
                    Pins this photo as the hero image at the top of your public gallery. Only one photo can be featured at a time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex flex-wrap gap-2 p-4 border-t border-white/10 shrink-0 bg-[oklch(0.2_0.035_235/0.5)]">
            <Button onClick={() => onSave(draft)} className="gap-2 flex-1 sm:flex-none">
              <Save className="size-4" /> Save
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
              className="gap-2"
            >
              <Trash2 className="size-4" /> Delete
            </Button>
          </div>
        </div>

        {index > 0 && (
          <button
            type="button"
            onClick={onPrev}
            className="hidden sm:inline-flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 size-10 items-center justify-center rounded-full glass border border-white/15"
            aria-label="Previous"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}
        {index < items.length - 1 && (
          <button
            type="button"
            onClick={onNext}
            className="hidden sm:inline-flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 size-10 items-center justify-center rounded-full glass border border-white/15"
            aria-label="Next"
          >
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this photo?"
        description="This will permanently remove the photo from your gallery. This cannot be undone."
        confirmLabel="Delete photo"
        tone="destructive"
        onConfirm={() => onDelete(draft.id)}
      />
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

"use client";

import { galleryCategories } from "@/lib/gallery-defaults";
import type { GalleryCategory } from "@/lib/gallery-types";
import { cn } from "@/lib/utils";

export function GalleryCategoryPicker({
  value,
  onChange,
}: {
  value: GalleryCategory;
  onChange: (category: GalleryCategory) => void;
}) {
  const options = galleryCategories.filter(
    (c): c is { id: GalleryCategory; label: string } => c.id !== "all",
  );

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Category</p>
      <div className="flex flex-wrap gap-2">
        {options.map((cat) => {
          const active = value === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs sm:text-sm font-medium transition",
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25"
                  : "glass border-white/12 text-muted-foreground hover:text-foreground hover:border-white/20",
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

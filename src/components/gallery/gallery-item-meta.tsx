"use client";

import { Calendar, MapPin } from "lucide-react";
import { galleryCategories } from "@/lib/gallery-defaults";
import { galleryCategoryBadgeStyles } from "@/lib/gallery-config";
import type { GalleryCategory, GalleryItem } from "@/lib/gallery-types";
import { cn } from "@/lib/utils";

export function formatGalleryCategory(category: GalleryCategory) {
  return galleryCategories.find((c) => c.id === category)?.label ?? category;
}

export function GalleryCategoryBadge({
  category,
  className,
}: {
  category: GalleryCategory;
  className?: string;
}) {
  const style = galleryCategoryBadgeStyles[category];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
        style.chip,
        style.border,
        style.text,
        className,
      )}
    >
      {formatGalleryCategory(category)}
    </span>
  );
}

/** High-contrast meta chips for lightbox and detail panels. */
export function GalleryItemMeta({ item, className }: { item: GalleryItem; className?: string }) {
  const style = galleryCategoryBadgeStyles[item.category];

  return (
    <div className={cn("flex flex-wrap items-center gap-2 sm:gap-3", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium",
          "bg-white/[0.08] border-white/20 text-foreground",
        )}
      >
        <Calendar className={cn("size-3.5 shrink-0", style.icon)} />
        {item.date}
      </span>
      {item.location && (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium",
            "bg-white/[0.08] border-white/20 text-foreground",
          )}
        >
          <MapPin className={cn("size-3.5 shrink-0", style.icon)} />
          {item.location}
        </span>
      )}
    </div>
  );
}

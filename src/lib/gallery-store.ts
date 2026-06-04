import { createSectionStore } from "@/lib/section-store";
import { defaultGalleryItems } from "@/lib/gallery-defaults";
import type { GalleryItem } from "@/lib/gallery-types";

export const useGalleryData = createSectionStore<GalleryItem[]>(
  "/api/gallery",
  defaultGalleryItems,
  "gallery-data-updated",
);

export { uid } from "@/lib/section-store";

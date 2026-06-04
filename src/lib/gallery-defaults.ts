import type { GalleryCategoryMeta, GalleryItem } from "./gallery-types";
import { EMPTY_GALLERY } from "@/lib/empty-data";

export const galleryCategories: GalleryCategoryMeta[] = [
  { id: "all", label: "All" },
  { id: "milestones", label: "Milestones" },
  { id: "events", label: "Events" },
  { id: "team", label: "Team" },
  { id: "awards", label: "Awards" },
  { id: "speaking", label: "Speaking" },
];

export const defaultGalleryItems: GalleryItem[] = EMPTY_GALLERY;

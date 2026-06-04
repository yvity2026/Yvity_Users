export type GalleryCategory = "milestones" | "events" | "team" | "awards" | "speaking";

export type GalleryLayout = "hero" | "wide" | "tall" | "default";

export type GalleryItem = {
  id: string;
  title: string;
  caption: string;
  category: GalleryCategory;
  date: string;
  location?: string;
  imageUrl: string;
  featured?: boolean;
  layout?: GalleryLayout;
};

export type GalleryCategoryMeta = {
  id: GalleryCategory | "all";
  label: string;
};

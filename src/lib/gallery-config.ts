import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Star, Trophy, Users } from "lucide-react";
import type { GalleryCategory, GalleryItem } from "./gallery-types";

export const galleryPageCopy = {
  label: "Moments of Recognition",
  title: "Gallery",
  description:
    "A visual record of milestones, ceremonies, and recognitions from your advisory career.",
};

type BannerBucket = {
  label: string;
  icon: LucideIcon;
  match: (item: GalleryItem) => boolean;
};

const bannerBuckets: BannerBucket[] = [
  { label: "Certificate", icon: BadgeCheck, match: (i) => i.category === "milestones" },
  { label: "Award", icon: Trophy, match: (i) => i.category === "awards" },
  {
    label: "Recognition",
    icon: Star,
    match: (i) => i.category === "speaking" || i.category === "team",
  },
  { label: "Event", icon: Users, match: (i) => i.category === "events" },
];

export function computeGalleryBannerStats(items: GalleryItem[]) {
  return bannerBuckets.map((bucket) => ({
    label: bucket.label,
    icon: bucket.icon,
    value: String(items.filter(bucket.match).length),
  }));
}

export const galleryCategoryBadgeStyles: Record<
  GalleryCategory,
  { chip: string; border: string; text: string; icon: string }
> = {
  milestones: {
    chip: "bg-[oklch(0.82_0.13_205/0.2)]",
    border: "border-[oklch(0.82_0.13_205/0.45)]",
    text: "text-[oklch(0.9_0.1_205)]",
    icon: "text-[oklch(0.82_0.13_205)]",
  },
  events: {
    chip: "bg-[oklch(0.78_0.15_295/0.2)]",
    border: "border-[oklch(0.78_0.15_295/0.45)]",
    text: "text-[oklch(0.9_0.1_295)]",
    icon: "text-[oklch(0.78_0.15_295)]",
  },
  team: {
    chip: "bg-[oklch(0.82_0.16_162/0.2)]",
    border: "border-[oklch(0.82_0.16_162/0.45)]",
    text: "text-[oklch(0.92_0.08_162)]",
    icon: "text-[oklch(0.82_0.16_162)]",
  },
  awards: {
    chip: "bg-[oklch(0.85_0.16_78/0.2)]",
    border: "border-[oklch(0.85_0.16_78/0.45)]",
    text: "text-[oklch(0.92_0.1_78)]",
    icon: "text-[oklch(0.85_0.16_78)]",
  },
  speaking: {
    chip: "bg-[oklch(0.78_0.13_200/0.2)]",
    border: "border-[oklch(0.78_0.13_200/0.45)]",
    text: "text-[oklch(0.9_0.08_200)]",
    icon: "text-[oklch(0.78_0.13_200)]",
  },
};

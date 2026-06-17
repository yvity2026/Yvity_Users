import type { LucideIcon } from "lucide-react";
import { Award, GraduationCap, Heart, Shield, Star, Trophy, Users } from "lucide-react";
import type { AchievementCategory, AchievementIconStyle } from "./types";

export const achievementsPageCopy = {
  label: "Milestones That Define Excellence",
  title: "Achievements",
  description:
    "Every award reflects a promise kept — to clients, to quality, and to excellence in financial advisory.",
};

/** Placeholder stat tiles on the achievements banner until the advisor adds data. */
export const achievementsBannerStats = {
  mdrtLabel: "—",
  mdrtSub: "MDRT status",
  experienceValue: "—",
  experienceLabel: "Yrs Experience",
} as const;

export const achievementCategories: {
  id: AchievementCategory | "all";
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "all", label: "All", icon: Trophy },
  { id: "life", label: "Life Insurance", icon: Shield },
  { id: "health", label: "Health Insurance", icon: Heart },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "other", label: "Others", icon: Star },
];

export type AchievementAccent = {
  text: string;
  border: string;
  chip: string;
  soft: string;
  top: string;
  ring: string;
};

export const achievementCategoryAccents: Record<AchievementCategory, AchievementAccent> = {
  life: {
    text: "text-[oklch(0.82_0.13_205)]",
    border: "border-[oklch(0.82_0.13_205/0.35)]",
    chip: "bg-[oklch(0.82_0.13_205/0.12)] text-[oklch(0.82_0.13_205)]",
    soft: "bg-[oklch(0.82_0.13_205/0.08)]",
    top: "bg-[oklch(0.82_0.13_205)]",
    ring: "ring-glow-cyan",
  },
  health: {
    text: "text-[oklch(0.82_0.16_162)]",
    border: "border-[oklch(0.82_0.16_162/0.35)]",
    chip: "bg-[oklch(0.82_0.16_162/0.12)] text-[oklch(0.82_0.16_162)]",
    soft: "bg-[oklch(0.82_0.16_162/0.08)]",
    top: "bg-[oklch(0.82_0.16_162)]",
    ring: "ring-glow-emerald",
  },
  education: {
    text: "text-[oklch(0.78_0.15_295)]",
    border: "border-[oklch(0.78_0.15_295/0.35)]",
    chip: "bg-[oklch(0.78_0.15_295/0.12)] text-[oklch(0.78_0.15_295)]",
    soft: "bg-[oklch(0.78_0.15_295/0.08)]",
    top: "bg-[oklch(0.78_0.15_295)]",
    ring: "ring-glow-violet",
  },
  other: {
    text: "text-[oklch(0.85_0.16_78)]",
    border: "border-[oklch(0.85_0.16_78/0.35)]",
    chip: "bg-[oklch(0.85_0.16_78/0.12)] text-[oklch(0.85_0.16_78)]",
    soft: "bg-[oklch(0.85_0.16_78/0.08)]",
    top: "bg-[oklch(0.85_0.16_78)]",
    ring: "ring-glow-amber",
  },
};

export const achievementIconMap: Record<Exclude<AchievementIconStyle, "mdrt">, LucideIcon> = {
  trophy: Trophy,
  ribbon: Award,
  star: Star,
  heart: Heart,
  graduation: GraduationCap,
  users: Users,
};

export const achievementCategoryLabels: Record<AchievementCategory, string> = {
  life: "Life Insurance",
  health: "Health Insurance",
  education: "Education",
  other: "Others",
};

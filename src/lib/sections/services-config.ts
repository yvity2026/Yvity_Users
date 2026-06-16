import type { LucideIcon } from "lucide-react";
import { Heart, Shield, TrendingUp, Umbrella } from "lucide-react";
import type { ServiceCategory } from "./types";

export const servicesPageCopy = {
  label: "What I Offer",
  title: "My Services",
  description:
    "Comprehensive financial protection and wealth-building solutions — all under one verified advisor.",
};

export type ServiceAccent = {
  icon: LucideIcon;
  ring: string;
  text: string;
  border: string;
  chip: string;
  soft: string;
  ratio: string;
  /** Dark category-tinted gradient for the card header title bar. */
  headerGradient: string;
};

/** Public card header — always the insurance category, never the advisor designation. */
export const SERVICE_CATEGORY_HEADINGS: Record<ServiceCategory, string> = {
  life: "Life Insurance",
  health: "Health Insurance",
  general: "General Insurance",
  mutual: "Mutual Funds",
};

export function categoryHeadingFor(category: ServiceCategory): string {
  return SERVICE_CATEGORY_HEADINGS[category];
}

export const serviceAccents: Record<ServiceCategory, ServiceAccent> = {
  life: {
    icon: Shield,
    ring: "ring-glow-cyan",
    text: "text-[oklch(0.82_0.13_205)]",
    border: "border-[oklch(0.82_0.13_205/0.35)]",
    chip: "bg-[oklch(0.82_0.13_205/0.12)] text-[oklch(0.82_0.13_205)]",
    soft: "bg-[oklch(0.82_0.13_205/0.08)]",
    ratio: "from-[oklch(0.82_0.13_205/0.2)] to-[oklch(0.82_0.13_205/0.06)]",
    // Deep teal — matches YVITY brand primary
    headerGradient: "bg-gradient-to-br from-[oklch(0.28_0.10_205)] to-[oklch(0.18_0.06_205)]",
  },
  health: {
    icon: Heart,
    ring: "ring-glow-emerald",
    text: "text-[oklch(0.82_0.16_162)]",
    border: "border-[oklch(0.82_0.16_162/0.35)]",
    chip: "bg-[oklch(0.82_0.16_162/0.12)] text-[oklch(0.82_0.16_162)]",
    soft: "bg-[oklch(0.82_0.16_162/0.08)]",
    ratio: "from-[oklch(0.82_0.16_162/0.2)] to-[oklch(0.82_0.16_162/0.06)]",
    // Deep emerald — health/vitality
    headerGradient: "bg-gradient-to-br from-[oklch(0.28_0.11_162)] to-[oklch(0.18_0.06_162)]",
  },
  general: {
    icon: Umbrella,
    ring: "ring-glow-amber",
    text: "text-[oklch(0.85_0.16_78)]",
    border: "border-[oklch(0.85_0.16_78/0.35)]",
    chip: "bg-[oklch(0.85_0.16_78/0.12)] text-[oklch(0.85_0.16_78)]",
    soft: "bg-[oklch(0.85_0.16_78/0.08)]",
    ratio: "from-[oklch(0.85_0.16_78/0.2)] to-[oklch(0.85_0.16_78/0.06)]",
    // Deep amber/gold — protection/security
    headerGradient: "bg-gradient-to-br from-[oklch(0.28_0.10_78)] to-[oklch(0.18_0.06_78)]",
  },
  mutual: {
    icon: TrendingUp,
    ring: "ring-glow-violet",
    text: "text-[oklch(0.78_0.15_295)]",
    border: "border-[oklch(0.78_0.15_295/0.35)]",
    chip: "bg-[oklch(0.78_0.15_295/0.12)] text-[oklch(0.78_0.15_295)]",
    soft: "bg-[oklch(0.78_0.15_295/0.08)]",
    ratio: "from-[oklch(0.78_0.15_295/0.2)] to-[oklch(0.78_0.15_295/0.06)]",
    // Deep violet — wealth/growth
    headerGradient: "bg-gradient-to-br from-[oklch(0.28_0.10_295)] to-[oklch(0.18_0.06_295)]",
  },
};

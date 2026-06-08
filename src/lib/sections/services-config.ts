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
  },
  health: {
    icon: Heart,
    ring: "ring-glow-emerald",
    text: "text-[oklch(0.82_0.16_162)]",
    border: "border-[oklch(0.82_0.16_162/0.35)]",
    chip: "bg-[oklch(0.82_0.16_162/0.12)] text-[oklch(0.82_0.16_162)]",
    soft: "bg-[oklch(0.82_0.16_162/0.08)]",
    ratio: "from-[oklch(0.82_0.16_162/0.2)] to-[oklch(0.82_0.16_162/0.06)]",
  },
  general: {
    icon: Umbrella,
    ring: "ring-glow-amber",
    text: "text-[oklch(0.85_0.16_78)]",
    border: "border-[oklch(0.85_0.16_78/0.35)]",
    chip: "bg-[oklch(0.85_0.16_78/0.12)] text-[oklch(0.85_0.16_78)]",
    soft: "bg-[oklch(0.85_0.16_78/0.08)]",
    ratio: "from-[oklch(0.85_0.16_78/0.2)] to-[oklch(0.85_0.16_78/0.06)]",
  },
  mutual: {
    icon: TrendingUp,
    ring: "ring-glow-violet",
    text: "text-[oklch(0.78_0.15_295)]",
    border: "border-[oklch(0.78_0.15_295/0.35)]",
    chip: "bg-[oklch(0.78_0.15_295/0.12)] text-[oklch(0.78_0.15_295)]",
    soft: "bg-[oklch(0.78_0.15_295/0.08)]",
    ratio: "from-[oklch(0.78_0.15_295/0.2)] to-[oklch(0.78_0.15_295/0.06)]",
  },
};

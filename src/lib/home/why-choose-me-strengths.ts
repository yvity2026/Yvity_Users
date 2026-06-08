import type { LucideIcon } from "lucide-react";
import { Briefcase, FileCheck, HeartHandshake, Layers, Shield, Sparkles, Trophy } from "lucide-react";
import { formatMdrtStatusLabel } from "@/lib/sections/achievement-tiers";
import type { AchievementItem } from "@/lib/sections/types";

export type WhyChooseMeStrength = {
  id: string;
  label: string;
  icon: LucideIcon;
  accent: string;
  glow: string;
  ring: string;
};

const strengthAccents = [
  {
    accent: "from-[oklch(0.85_0.16_78)] to-[oklch(0.72_0.15_55)]",
    glow: "bg-[oklch(0.85_0.16_78/0.18)]",
    ring: "ring-[oklch(0.85_0.16_78/0.35)]",
  },
  {
    accent: "from-[oklch(0.82_0.13_205)] to-primary",
    glow: "bg-[oklch(0.82_0.13_205/0.18)]",
    ring: "ring-[oklch(0.82_0.13_205/0.35)]",
  },
  {
    accent: "from-[oklch(0.78_0.16_162)] to-[oklch(0.62_0.12_185)]",
    glow: "bg-[oklch(0.78_0.16_162/0.18)]",
    ring: "ring-[oklch(0.78_0.16_162/0.35)]",
  },
  {
    accent: "from-[oklch(0.78_0.15_295)] to-[oklch(0.58_0.14_260)]",
    glow: "bg-[oklch(0.78_0.15_295/0.18)]",
    ring: "ring-[oklch(0.78_0.15_295/0.35)]",
  },
  {
    accent: "from-[oklch(0.82_0.13_205)] to-[oklch(0.72_0.11_198)]",
    glow: "bg-[oklch(0.82_0.13_205/0.15)]",
    ring: "ring-[oklch(0.82_0.13_205/0.3)]",
  },
  {
    accent: "from-[oklch(0.85_0.16_78)] to-[oklch(0.78_0.14_162)]",
    glow: "bg-[oklch(0.85_0.16_78/0.14)]",
    ring: "ring-[oklch(0.85_0.16_78/0.3)]",
  },
] as const;

function irdaLabel(): string {
  return "IRDA Certified Professional";
}

function multiServiceLabel(serviceCount: number): string {
  if (serviceCount >= 3) return "Multi-Service Expertise";
  if (serviceCount === 0) return "Multi-Service Expertise";
  return "Multi-Service Expertise";
}

/** Advisor strengths for the home “Why Choose Me” grid — profile-aware where possible. */
export function getWhyChooseMeStrengths(
  achievements: Pick<AchievementItem, "title" | "subtitle" | "years">[] = [],
  options?: { experienceDisplay?: string; serviceCount?: number },
): WhyChooseMeStrength[] {
  const mdrtLabel = formatMdrtStatusLabel(achievements);
  const experienceDisplay = options?.experienceDisplay?.trim() || "";
  const serviceCount = options?.serviceCount ?? 0;
  const items: Array<{ id: string; label: string; icon: LucideIcon }> = [];

  if (mdrtLabel !== "—") {
    items.push({
      id: "mdrt",
      label: `${mdrtLabel} Recognized`,
      icon: Trophy,
    });
  }

  if (experienceDisplay) {
    items.push({
      id: "experience",
      label: `${experienceDisplay} Experience`,
      icon: Briefcase,
    });
  }

  items.push(
    {
      id: "irda",
      label: irdaLabel(),
      icon: Shield,
    },
    {
      id: "guidance",
      label: "Personalized Financial Guidance",
      icon: Sparkles,
    },
    {
      id: "claims",
      label: "Claim Support Assistance",
      icon: FileCheck,
    },
    {
      id: "customer",
      label: "Customer-Centric Approach",
      icon: HeartHandshake,
    },
    {
      id: "services",
      label: multiServiceLabel(serviceCount),
      icon: Layers,
    },
  );

  return items.map((item, i) => ({
    ...item,
    ...strengthAccents[i % strengthAccents.length],
  }));
}

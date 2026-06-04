import type { LucideIcon } from "lucide-react";
import { Briefcase, FileCheck, HeartHandshake, Layers, Shield, Sparkles } from "lucide-react";
import { advisorProfile } from "@/lib/advisor-profile";

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
  const match = advisorProfile.highlights.find((h) => h.label.toLowerCase().includes("irda"));
  if (!match) return "IRDA Certified Professional";
  return match.label.toLowerCase().includes("professional")
    ? match.label
    : `${match.label} Professional`;
}

function multiServiceLabel(): string {
  const chips = advisorProfile.home.serviceChips;
  if (chips.length >= 3) return "Multi-Service Expertise";
  if (chips.length === 0) return "Multi-Service Expertise";
  return chips.map((c) => c.label.replace(/ Insurance$/, "")).join(", ") + " Expertise";
}

/** Advisor strengths for the home “Why Choose Me” grid — profile-aware where possible. */
export function getWhyChooseMeStrengths(): WhyChooseMeStrength[] {
  const items: Array<{ id: string; label: string; icon: LucideIcon }> = [
    {
      id: "experience",
      label: `${advisorProfile.experienceDisplay} Experience`,
      icon: Briefcase,
    },
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
      label: multiServiceLabel(),
      icon: Layers,
    },
  ];

  return items.map((item, i) => ({
    ...item,
    ...strengthAccents[i % strengthAccents.length],
  }));
}

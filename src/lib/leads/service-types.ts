import type { LucideIcon } from "lucide-react";
import {
  Car,
  GraduationCap,
  Heart,
  LifeBuoy,
  LineChart,
  PiggyBank,
  Plane,
  Shield,
  Sunrise,
  TrendingUp,
  Umbrella,
} from "lucide-react";

/** Lead service types — used in Add/Edit Lead and display. */
export const LEAD_SERVICE_TYPES = [
  { id: "life", label: "Life Insurance", tone: "cyan" as const },
  { id: "health", label: "Health Insurance", tone: "emerald" as const },
  { id: "general", label: "General Insurance", tone: "amber" as const },
  { id: "motor", label: "Motor Insurance", tone: "sky" as const },
  { id: "travel", label: "Travel Insurance", tone: "violet" as const },
  { id: "claim", label: "Claim Assistance", tone: "rose" as const },
  { id: "mutual", label: "Mutual Funds", tone: "indigo" as const },
  { id: "financial_planning", label: "Financial Planning", tone: "teal" as const },
  { id: "retirement_planning", label: "Retirement Planning", tone: "gold" as const },
  { id: "child_education", label: "Child Education Planning", tone: "pink" as const },
] as const;

export type LeadServiceType = (typeof LEAD_SERVICE_TYPES)[number]["id"];

export type LeadTone = (typeof LEAD_SERVICE_TYPES)[number]["tone"];

/** Icon for each service — used by lead cards and add/edit modals. */
export const LEAD_SERVICE_ICONS: Record<LeadServiceType, LucideIcon> = {
  life: Shield,
  health: Heart,
  general: Umbrella,
  motor: Car,
  travel: Plane,
  claim: LifeBuoy,
  mutual: TrendingUp,
  financial_planning: LineChart,
  retirement_planning: Sunrise,
  child_education: GraduationCap,
};

export type LeadToneStyle = {
  /** Solid icon-color (`text-[oklch(...)]`). */
  icon: string;
  /** Soft icon container background tint. */
  iconBg: string;
  /** Container ring color (light hairline). */
  iconRing: string;
  /** Solid accent stripe — used as a left ribbon on the card. */
  stripe: string;
  /** Subtle hover tint applied to the whole card. */
  hoverTint: string;
  /** Small chip background — `bg-[...]/0.1` style. */
  chipBg: string;
  /** Small chip text. */
  chipText: string;
};

/**
 * Theme-agnostic OKLCH palette mapped to each lead service tone. Mirrors the
 * "services in home section" feel: vivid, premium colour-coded surfaces with
 * soft tints rather than heavy fills, so the card stays readable in dark and
 * light themes alike.
 */
export const LEAD_TONE_STYLES: Record<LeadTone, LeadToneStyle> = {
  cyan: {
    icon: "text-[oklch(0.82_0.13_205)]",
    iconBg: "bg-[oklch(0.82_0.13_205/0.14)]",
    iconRing: "ring-[oklch(0.82_0.13_205/0.4)]",
    stripe: "bg-[oklch(0.82_0.13_205)]",
    hoverTint: "group-hover:bg-[oklch(0.82_0.13_205/0.04)]",
    chipBg: "bg-[oklch(0.82_0.13_205/0.12)]",
    chipText: "text-[oklch(0.82_0.13_205)]",
  },
  emerald: {
    icon: "text-[oklch(0.82_0.16_162)]",
    iconBg: "bg-[oklch(0.82_0.16_162/0.14)]",
    iconRing: "ring-[oklch(0.82_0.16_162/0.4)]",
    stripe: "bg-[oklch(0.82_0.16_162)]",
    hoverTint: "group-hover:bg-[oklch(0.82_0.16_162/0.04)]",
    chipBg: "bg-[oklch(0.82_0.16_162/0.12)]",
    chipText: "text-[oklch(0.82_0.16_162)]",
  },
  amber: {
    icon: "text-[oklch(0.85_0.16_78)]",
    iconBg: "bg-[oklch(0.85_0.16_78/0.16)]",
    iconRing: "ring-[oklch(0.85_0.16_78/0.4)]",
    stripe: "bg-[oklch(0.85_0.16_78)]",
    hoverTint: "group-hover:bg-[oklch(0.85_0.16_78/0.04)]",
    chipBg: "bg-[oklch(0.85_0.16_78/0.12)]",
    chipText: "text-[oklch(0.85_0.16_78)]",
  },
  sky: {
    icon: "text-[oklch(0.82_0.12_230)]",
    iconBg: "bg-[oklch(0.82_0.12_230/0.14)]",
    iconRing: "ring-[oklch(0.82_0.12_230/0.4)]",
    stripe: "bg-[oklch(0.82_0.12_230)]",
    hoverTint: "group-hover:bg-[oklch(0.82_0.12_230/0.04)]",
    chipBg: "bg-[oklch(0.82_0.12_230/0.12)]",
    chipText: "text-[oklch(0.82_0.12_230)]",
  },
  violet: {
    icon: "text-[oklch(0.78_0.15_295)]",
    iconBg: "bg-[oklch(0.78_0.15_295/0.14)]",
    iconRing: "ring-[oklch(0.78_0.15_295/0.4)]",
    stripe: "bg-[oklch(0.78_0.15_295)]",
    hoverTint: "group-hover:bg-[oklch(0.78_0.15_295/0.04)]",
    chipBg: "bg-[oklch(0.78_0.15_295/0.12)]",
    chipText: "text-[oklch(0.78_0.15_295)]",
  },
  rose: {
    icon: "text-[oklch(0.78_0.18_15)]",
    iconBg: "bg-[oklch(0.78_0.18_15/0.14)]",
    iconRing: "ring-[oklch(0.78_0.18_15/0.4)]",
    stripe: "bg-[oklch(0.78_0.18_15)]",
    hoverTint: "group-hover:bg-[oklch(0.78_0.18_15/0.04)]",
    chipBg: "bg-[oklch(0.78_0.18_15/0.12)]",
    chipText: "text-[oklch(0.78_0.18_15)]",
  },
  indigo: {
    icon: "text-[oklch(0.74_0.16_270)]",
    iconBg: "bg-[oklch(0.74_0.16_270/0.14)]",
    iconRing: "ring-[oklch(0.74_0.16_270/0.4)]",
    stripe: "bg-[oklch(0.74_0.16_270)]",
    hoverTint: "group-hover:bg-[oklch(0.74_0.16_270/0.04)]",
    chipBg: "bg-[oklch(0.74_0.16_270/0.12)]",
    chipText: "text-[oklch(0.74_0.16_270)]",
  },
  teal: {
    icon: "text-[oklch(0.78_0.13_195)]",
    iconBg: "bg-[oklch(0.78_0.13_195/0.14)]",
    iconRing: "ring-[oklch(0.78_0.13_195/0.4)]",
    stripe: "bg-[oklch(0.78_0.13_195)]",
    hoverTint: "group-hover:bg-[oklch(0.78_0.13_195/0.04)]",
    chipBg: "bg-[oklch(0.78_0.13_195/0.12)]",
    chipText: "text-[oklch(0.78_0.13_195)]",
  },
  gold: {
    icon: "text-[oklch(0.83_0.15_92)]",
    iconBg: "bg-[oklch(0.83_0.15_92/0.16)]",
    iconRing: "ring-[oklch(0.83_0.15_92/0.4)]",
    stripe: "bg-[oklch(0.83_0.15_92)]",
    hoverTint: "group-hover:bg-[oklch(0.83_0.15_92/0.04)]",
    chipBg: "bg-[oklch(0.83_0.15_92/0.12)]",
    chipText: "text-[oklch(0.83_0.15_92)]",
  },
  pink: {
    icon: "text-[oklch(0.82_0.14_350)]",
    iconBg: "bg-[oklch(0.82_0.14_350/0.14)]",
    iconRing: "ring-[oklch(0.82_0.14_350/0.4)]",
    stripe: "bg-[oklch(0.82_0.14_350)]",
    hoverTint: "group-hover:bg-[oklch(0.82_0.14_350/0.04)]",
    chipBg: "bg-[oklch(0.82_0.14_350/0.12)]",
    chipText: "text-[oklch(0.82_0.14_350)]",
  },
};

/**
 * Selected-state Tailwind class string for each lead tone, used by the
 * Add / Edit lead modals' `SelectionCard.activeClassName`. Centralised
 * here so the two modals stay in lock-step instead of each maintaining
 * their own copy of the OKLCH ring/border/bg palette.
 */
export const LEAD_TONE_SELECTED: Record<LeadTone, string> = {
  cyan: "ring-[oklch(0.82_0.13_205/0.45)] border-[oklch(0.82_0.13_205/0.55)] bg-[oklch(0.82_0.13_205/0.15)]",
  emerald:
    "ring-[oklch(0.82_0.16_162/0.45)] border-[oklch(0.82_0.16_162/0.55)] bg-[oklch(0.82_0.16_162/0.15)]",
  amber:
    "ring-[oklch(0.85_0.16_78/0.45)] border-[oklch(0.85_0.16_78/0.55)] bg-[oklch(0.85_0.16_78/0.12)]",
  sky: "ring-[oklch(0.75_0.12_230/0.45)] border-[oklch(0.75_0.12_230/0.55)] bg-[oklch(0.75_0.12_230/0.12)]",
  violet:
    "ring-[oklch(0.78_0.15_295/0.45)] border-[oklch(0.78_0.15_295/0.55)] bg-[oklch(0.78_0.15_295/0.12)]",
  rose: "ring-[oklch(0.72_0.18_15/0.4)] border-[oklch(0.72_0.18_15/0.5)] bg-[oklch(0.72_0.18_15/0.12)]",
  indigo:
    "ring-[oklch(0.55_0.13_260/0.45)] border-[oklch(0.55_0.13_260/0.55)] bg-[oklch(0.55_0.13_260/0.12)]",
  teal: "ring-[oklch(0.65_0.13_185/0.45)] border-[oklch(0.65_0.13_185/0.55)] bg-[oklch(0.65_0.13_185/0.12)]",
  gold: "ring-[oklch(0.85_0.16_78/0.45)] border-[oklch(0.85_0.16_78/0.55)] bg-[oklch(0.85_0.16_78/0.1)]",
  pink: "ring-[oklch(0.72_0.18_15/0.35)] border-[oklch(0.78_0.15_295/0.45)] bg-[oklch(0.78_0.15_295/0.1)]",
};

export function getLeadServiceTone(id: LeadServiceType): LeadTone {
  return LEAD_SERVICE_TYPES.find((s) => s.id === id)?.tone ?? "cyan";
}

/** Convenience: `activeClassName` string for the SelectionCard inside
 *  the Add / Edit Lead modals. */
export function getLeadToneSelected(tone: LeadTone): string {
  return LEAD_TONE_SELECTED[tone];
}

export function getLeadServiceIcon(id: LeadServiceType): LucideIcon {
  return LEAD_SERVICE_ICONS[id] ?? Shield;
}

export function getLeadToneStyle(id: LeadServiceType): LeadToneStyle {
  return LEAD_TONE_STYLES[getLeadServiceTone(id)];
}

const LEGACY_SERVICE_MAP: Record<string, LeadServiceType> = {
  review: "financial_planning",
  renewal: "general",
  others: "financial_planning",
};

export function normalizeLeadServiceType(raw: string): LeadServiceType {
  if (LEAD_SERVICE_TYPES.some((s) => s.id === raw)) return raw as LeadServiceType;
  return LEGACY_SERVICE_MAP[raw] ?? "general";
}

export function mapContactInterestToLeadService(interestId: string): LeadServiceType {
  return normalizeLeadServiceType(interestId);
}

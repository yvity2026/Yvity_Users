/** Topics shown in the contact sheet “Interested in” chips. */
export const contactInterestOptions = [
  { id: "life", label: "Life Insurance", tone: "cyan" as const },
  { id: "health", label: "Health Insurance", tone: "emerald" as const },
  { id: "general", label: "General Insurance", tone: "amber" as const },
  { id: "mutual", label: "Mutual Funds", tone: "violet" as const },
  { id: "claim", label: "Claim Assistance", tone: "rose" as const },
  { id: "review", label: "Policy Review", tone: "cyan" as const },
  { id: "renewal", label: "Renewal", tone: "emerald" as const },
  { id: "others", label: "Others", tone: "muted" as const },
] as const;

export type ContactInterestId = (typeof contactInterestOptions)[number]["id"];

export type ContactInquiry = {
  id: string;
  fullName: string;
  mobile: string;
  interests: ContactInterestId[];
  message?: string;
  createdAt: string;
};

export const contactInterestTones: Record<
  (typeof contactInterestOptions)[number]["tone"],
  { active: string; idle: string }
> = {
  cyan: {
    active:
      "border-[oklch(0.82_0.13_205/0.55)] bg-[oklch(0.82_0.13_205/0.18)] text-[oklch(0.88_0.12_205)]",
    idle: "border-white/12 bg-white/[0.04] text-foreground/85 hover:border-[oklch(0.82_0.13_205/0.35)]",
  },
  emerald: {
    active:
      "border-[oklch(0.82_0.16_162/0.55)] bg-[oklch(0.82_0.16_162/0.18)] text-[oklch(0.88_0.14_162)]",
    idle: "border-white/12 bg-white/[0.04] text-foreground/85 hover:border-[oklch(0.82_0.16_162/0.35)]",
  },
  amber: {
    active:
      "border-[oklch(0.85_0.16_78/0.55)] bg-[oklch(0.85_0.16_78/0.18)] text-[oklch(0.9_0.14_78)]",
    idle: "border-white/12 bg-white/[0.04] text-foreground/85 hover:border-[oklch(0.85_0.16_78/0.35)]",
  },
  violet: {
    active:
      "border-[oklch(0.78_0.15_295/0.55)] bg-[oklch(0.78_0.15_295/0.18)] text-[oklch(0.86_0.13_295)]",
    idle: "border-white/12 bg-white/[0.04] text-foreground/85 hover:border-[oklch(0.78_0.15_295/0.35)]",
  },
  rose: {
    active:
      "border-[oklch(0.72_0.18_15/0.5)] bg-[oklch(0.72_0.18_15/0.15)] text-[oklch(0.88_0.12_15)]",
    idle: "border-white/12 bg-white/[0.04] text-foreground/85 hover:border-[oklch(0.72_0.18_15/0.35)]",
  },
  muted: {
    active: "border-white/25 bg-white/10 text-foreground",
    idle: "border-white/12 bg-white/[0.04] text-foreground/85 hover:border-white/20",
  },
};

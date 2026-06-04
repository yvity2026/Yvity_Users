import type { FollowUpType, LeadChannel, LeadPriority, LeadStatus, SelfLeadChannel } from "./types";

export const LEAD_STATUSES: { id: LeadStatus; label: string; emoji: string }[] = [
  { id: "new", label: "New", emoji: "🟡" },
  { id: "interested", label: "Interested", emoji: "🟢" },
  { id: "follow_up", label: "Follow-Up", emoji: "🔵" },
  { id: "proposal_shared", label: "Proposal Shared", emoji: "🟣" },
  { id: "converted", label: "Converted", emoji: "✅" },
  { id: "not_interested", label: "Not Interested", emoji: "🔴" },
  { id: "not_contactable", label: "Not Contactable", emoji: "⚫" },
];

export const FOLLOW_UP_TYPES: { id: FollowUpType; label: string }[] = [
  { id: "call", label: "Call" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "physical_meeting", label: "Physical Meeting" },
  { id: "online_meeting", label: "Online Meeting" },
  { id: "proposal_shared", label: "Proposal Shared" },
];

export const SELF_LEAD_SOURCES: { id: SelfLeadChannel; label: string }[] = [
  { id: "self_referral", label: "Referral" },
  { id: "self_manual", label: "Manual Entry" },
];

export function sourceLabel(channel: LeadChannel): string {
  if (channel === "self_referral") return "Referral";
  if (channel === "self_manual") return "Manual Entry";
  return "Public Profile";
}

export function statusLabel(status: LeadStatus): string {
  return LEAD_STATUSES.find((s) => s.id === status)?.label ?? status;
}

export function statusEmoji(status: LeadStatus): string {
  return LEAD_STATUSES.find((s) => s.id === status)?.emoji ?? "";
}

export const STATUS_STYLES: Record<LeadStatus, { badge: string; dot: string }> = {
  new: {
    badge:
      "bg-[oklch(0.85_0.16_78/0.18)] text-[oklch(0.92_0.14_78)] border-[oklch(0.85_0.16_78/0.4)]",
    dot: "bg-[oklch(0.85_0.16_78)]",
  },
  interested: {
    badge:
      "bg-[oklch(0.82_0.16_162/0.18)] text-[oklch(0.88_0.14_162)] border-[oklch(0.82_0.16_162/0.4)]",
    dot: "bg-[oklch(0.82_0.16_162)]",
  },
  follow_up: {
    badge:
      "bg-[oklch(0.82_0.13_205/0.18)] text-[oklch(0.88_0.12_205)] border-[oklch(0.82_0.13_205/0.4)]",
    dot: "bg-[oklch(0.82_0.13_205)]",
  },
  proposal_shared: {
    badge:
      "bg-[oklch(0.78_0.15_295/0.18)] text-[oklch(0.86_0.13_295)] border-[oklch(0.78_0.15_295/0.4)]",
    dot: "bg-[oklch(0.78_0.15_295)]",
  },
  converted: {
    badge:
      "bg-[oklch(0.82_0.16_162/0.22)] text-[oklch(0.9_0.14_162)] border-[oklch(0.82_0.16_162/0.5)]",
    dot: "bg-[oklch(0.82_0.16_162)]",
  },
  not_interested: {
    badge:
      "bg-[oklch(0.72_0.18_15/0.15)] text-[oklch(0.88_0.12_15)] border-[oklch(0.72_0.18_15/0.35)]",
    dot: "bg-[oklch(0.72_0.18_15)]",
  },
  not_contactable: {
    badge: "bg-white/10 text-muted-foreground border-white/20",
    dot: "bg-white/50",
  },
};

export function isPlatformLead(channel: LeadChannel): boolean {
  return channel === "yvity_public_profile";
}

export const LEAD_PRIORITIES: {
  id: LeadPriority;
  label: string;
  emoji: string;
  activeClass: string;
  idleClass: string;
}[] = [
  {
    id: "high",
    label: "High",
    emoji: "🔴",
    activeClass:
      "border-[oklch(0.72_0.18_15/0.65)] bg-[oklch(0.72_0.18_15/0.22)] text-[oklch(0.92_0.12_15)] ring-2 ring-[oklch(0.72_0.18_15/0.35)]",
    idleClass: "border-white/12 bg-white/[0.03] hover:border-[oklch(0.72_0.18_15/0.35)]",
  },
  {
    id: "medium",
    label: "Medium",
    emoji: "🟡",
    activeClass:
      "border-[oklch(0.85_0.16_78/0.65)] bg-[oklch(0.85_0.16_78/0.2)] text-[oklch(0.92_0.14_78)] ring-2 ring-[oklch(0.85_0.16_78/0.35)]",
    idleClass: "border-white/12 bg-white/[0.03] hover:border-[oklch(0.85_0.16_78/0.35)]",
  },
  {
    id: "low",
    label: "Low",
    emoji: "⚪",
    activeClass: "border-white/35 bg-white/12 text-foreground ring-2 ring-white/20",
    idleClass: "border-white/12 bg-white/[0.03] hover:border-white/25",
  },
];

export function priorityLabel(priority: LeadPriority): string {
  return LEAD_PRIORITIES.find((p) => p.id === priority)?.label ?? priority;
}

export function priorityEmoji(priority: LeadPriority): string {
  return LEAD_PRIORITIES.find((p) => p.id === priority)?.emoji ?? "";
}

import {
  LEAD_SERVICE_TYPES,
  normalizeLeadServiceType,
  type LeadServiceType,
} from "@/lib/leads/service-types";
import type { Lead, LeadStatus, LeadsOverviewStats } from "./types";

export function phoneDigits(mobile: string): string {
  return mobile.replace(/\D/g, "");
}

export function telHref(mobile: string): string {
  const d = phoneDigits(mobile);
  if (!d) return "tel:";
  const withCc = d.length === 10 ? `91${d}` : d;
  return `tel:+${withCc}`;
}

export function whatsAppHref(mobile: string, message?: string): string {
  const d = phoneDigits(mobile);
  if (!d) return "https://wa.me/";
  const num = d.length === 10 ? `91${d}` : d;
  const base = `https://wa.me/${num}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function serviceLabel(id: LeadServiceType | string): string {
  const normalized = normalizeLeadServiceType(id);
  return LEAD_SERVICE_TYPES.find((o) => o.id === normalized)?.label ?? "General";
}

export function formatCreatedDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** e.g. 15-May-2026 */
export function formatAddedDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString("en-IN", { month: "short" });
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatLastActivity(iso?: string): string {
  if (!iso) return "No activity yet";
  const d = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfActivity = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (startOfActivity.getTime() === startOfToday.getTime()) return "Today";
  if (startOfActivity.getTime() === startOfYesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function computeOverviewStats(leads: Lead[]): LeadsOverviewStats {
  return {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    interested: leads.filter((l) => l.status === "interested").length,
    followUpPending: leads.filter(
      (l) => l.status === "follow_up" || l.status === "proposal_shared" || Boolean(l.followUpDate),
    ).length,
    converted: leads.filter((l) => l.status === "converted").length,
    lost: leads.filter((l) => l.status === "not_interested" || l.status === "not_contactable")
      .length,
  };
}

export function sortLeadsNewestFirst(leads: Lead[]): Lead[] {
  return [...leads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

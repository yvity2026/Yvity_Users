import fs from "fs/promises";
import path from "path";
import type { ContactInquiry } from "@/lib/contact-config";
import {
  mapContactInterestToLeadService,
  normalizeLeadServiceType,
} from "@/lib/leads/service-types";
import type {
  CreateLeadInput,
  Lead,
  LeadChannel,
  LeadPriority,
  LeadStatus,
  UpdateLeadInput,
} from "@/lib/leads/types";
import { loadContactInquiries } from "@/lib/server/contact-persistence";

const DATA_DIR = path.join(process.cwd(), ".data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const LEGACY_STATUS: Record<string, LeadStatus> = {
  contacted: "interested",
  closed: "not_interested",
};

/** Normalize legacy stored leads into the current schema. */
export function normalizeLead(raw: Record<string, unknown>): Lead {
  const legacyServices = raw.interestedServices as string[] | undefined;
  const legacyNotes = raw.notes;
  let notes = "";
  if (typeof legacyNotes === "string") notes = legacyNotes;
  else if (Array.isArray(legacyNotes) && legacyNotes[0] && typeof legacyNotes[0] === "object") {
    notes = (legacyNotes as { text?: string }[])
      .map((n) => n.text ?? "")
      .filter(Boolean)
      .join("\n");
  }

  const rawChannel = String(raw.channel ?? "self_manual");
  let channel: LeadChannel = "self_manual";
  if (rawChannel === "self_referral") channel = "self_referral";
  else if (rawChannel === "yvity_public_profile" || rawChannel.startsWith("yvity_")) {
    channel = "yvity_public_profile";
  }

  const statusRaw = (raw.status as string) ?? "new";
  const status = (LEGACY_STATUS[statusRaw] ?? statusRaw) as LeadStatus;

  return {
    id: String(raw.id ?? uid("lead")),
    origin: channel === "yvity_public_profile" ? "yvity" : "self",
    channel,
    fullName: String(raw.fullName ?? ""),
    mobile: String(raw.mobile ?? ""),
    city: raw.city ? String(raw.city) : undefined,
    serviceType: normalizeLeadServiceType(
      String(raw.serviceType ?? legacyServices?.[0] ?? "general"),
    ),
    priority: (raw.priority as LeadPriority) ?? "medium",
    status,
    notes,
    followUpType: raw.followUpType as Lead["followUpType"],
    followUpDate: raw.followUpDate ? String(raw.followUpDate) : undefined,
    followUpTime: raw.followUpTime ? String(raw.followUpTime) : undefined,
    lastActivityAt: (raw.lastActivityAt ?? raw.lastInteractionAt) as string | undefined,
    convertedAt: raw.convertedAt as string | undefined,
    sourceInquiryId: raw.sourceInquiryId as string | undefined,
    message: raw.message as string | undefined,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? raw.createdAt ?? new Date().toISOString()),
  };
}

export async function loadLeads(): Promise<Lead[]> {
  try {
    const raw = await fs.readFile(LEADS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((row) => normalizeLead(row));
  } catch {
    return [];
  }
}

async function saveLeads(leads: Lead[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
}

function inquiryToLead(inquiry: ContactInquiry): Lead {
  const now = inquiry.createdAt;
  return {
    id: uid("lead"),
    origin: "yvity",
    channel: "yvity_public_profile",
    fullName: inquiry.fullName,
    mobile: inquiry.mobile,
    serviceType: mapContactInterestToLeadService(inquiry.interests[0] ?? "general"),
    priority: "medium",
    status: "new",
    notes: inquiry.message ?? "",
    message: inquiry.message,
    sourceInquiryId: inquiry.id,
    createdAt: now,
    updatedAt: now,
  };
}

export async function syncInquiriesToLeads(leads: Lead[]): Promise<Lead[]> {
  const inquiries = await loadContactInquiries();
  const linked = new Set(leads.map((l) => l.sourceInquiryId).filter(Boolean));
  const toAdd = inquiries.filter((i) => !linked.has(i.id)).map(inquiryToLead);
  if (toAdd.length === 0) return leads;
  const merged = [...toAdd, ...leads];
  await saveLeads(merged);
  return merged;
}

export async function listLeadsWithSync(): Promise<Lead[]> {
  const current = await loadLeads();
  return syncInquiriesToLeads(current);
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  let leads = await loadLeads();
  leads = await syncInquiriesToLeads(leads);

  const now = new Date().toISOString();
  const lead: Lead = {
    id: uid("lead"),
    origin: "self",
    channel: input.channel,
    fullName: input.fullName.trim(),
    mobile: input.mobile.trim(),
    city: input.city?.trim() || undefined,
    serviceType: input.serviceType,
    priority: input.priority,
    status: "new",
    notes: input.notes?.trim() ?? "",
    createdAt: now,
    updatedAt: now,
  };

  await saveLeads([lead, ...leads]);
  return lead;
}

export async function updateLead(id: string, patch: UpdateLeadInput): Promise<Lead | null> {
  const leads = await listLeadsWithSync();
  const index = leads.findIndex((l) => l.id === id);
  if (index < 0) return null;

  const current = leads[index]!;
  const now = new Date().toISOString();

  let convertedAt = current.convertedAt;
  if (patch.status === "converted" && current.status !== "converted") {
    convertedAt = now;
  }

  const updated: Lead = {
    ...current,
    fullName: patch.fullName?.trim() ?? current.fullName,
    mobile: patch.mobile?.trim() ?? current.mobile,
    city: patch.city !== undefined ? patch.city.trim() || undefined : current.city,
    channel: patch.channel && current.origin === "self" ? patch.channel : current.channel,
    serviceType: patch.serviceType ?? current.serviceType,
    priority: patch.priority ?? current.priority,
    status: patch.status ?? current.status,
    notes: patch.notes !== undefined ? patch.notes : current.notes,
    followUpType:
      patch.followUpType === null ? undefined : (patch.followUpType ?? current.followUpType),
    followUpDate:
      patch.followUpDate === null ? undefined : (patch.followUpDate ?? current.followUpDate),
    followUpTime:
      patch.followUpTime === null ? undefined : (patch.followUpTime ?? current.followUpTime),
    lastActivityAt: patch.lastActivityAt ?? current.lastActivityAt,
    convertedAt,
    updatedAt: now,
  };

  if (patch.status || patch.followUpType || patch.notes !== undefined) {
    updated.lastActivityAt = patch.lastActivityAt ?? now;
  }

  const next = [...leads];
  next[index] = updated;
  await saveLeads(next);
  return updated;
}

export async function deleteLead(id: string): Promise<boolean> {
  const leads = await listLeadsWithSync();
  const next = leads.filter((l) => l.id !== id);
  if (next.length === leads.length) return false;
  await saveLeads(next);
  return true;
}

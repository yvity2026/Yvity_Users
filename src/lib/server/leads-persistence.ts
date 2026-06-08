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
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import {
  deleteLeadForAdvisor,
  insertLeadForAdvisor,
  loadLeadsForAdvisor,
  saveLeadsForAdvisor,
  updateLeadForAdvisor,
} from "@/lib/server/supabase/leads-supabase";

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

async function loadLeadsJson(): Promise<Lead[]> {
  try {
    const raw = await fs.readFile(LEADS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((row) => normalizeLead(row));
  } catch {
    return [];
  }
}

async function saveLeadsJson(leads: Lead[]): Promise<void> {
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
    notes: "",
    message: inquiry.message,
    sourceInquiryId: inquiry.id,
    createdAt: now,
    updatedAt: now,
  };
}

async function syncInquiriesToLeads(advisorUserId: string, leads: Lead[]): Promise<Lead[]> {
  const inquiries = await loadContactInquiries(advisorUserId);
  const linked = new Set(leads.map((l) => l.sourceInquiryId).filter(Boolean));
  const toAdd = inquiries.filter((i) => !linked.has(i.id)).map(inquiryToLead);
  if (toAdd.length === 0) return leads;
  const merged = [...toAdd, ...leads];
  if (useSupabasePersistence()) {
    await saveLeadsForAdvisor(advisorUserId, merged);
  } else {
    await saveLeadsJson(merged);
  }
  return merged;
}

export async function listLeadsWithSync(advisorUserId: string): Promise<Lead[]> {
  const current = useSupabasePersistence()
    ? await loadLeadsForAdvisor(advisorUserId)
    : await loadLeadsJson();
  return syncInquiriesToLeads(advisorUserId, current);
}

export async function createLead(advisorUserId: string, input: CreateLeadInput): Promise<Lead> {
  let leads = useSupabasePersistence()
    ? await loadLeadsForAdvisor(advisorUserId)
    : await loadLeadsJson();
  leads = await syncInquiriesToLeads(advisorUserId, leads);

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

  if (useSupabasePersistence()) {
    return insertLeadForAdvisor(advisorUserId, lead);
  }

  await saveLeadsJson([lead, ...leads]);
  return lead;
}

export async function updateLead(
  advisorUserId: string,
  id: string,
  patch: UpdateLeadInput,
): Promise<Lead | null> {
  if (useSupabasePersistence()) {
    const leads = await listLeadsWithSync(advisorUserId);
    const index = leads.findIndex((l) => l.id === id);
    if (index < 0) return null;

    const current = leads[index]!;
    const now = new Date().toISOString();

    let convertedAt = current.convertedAt;
    if (patch.status === "converted" && current.status !== "converted") {
      convertedAt = now;
    }

    const merged: Lead = {
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
      merged.lastActivityAt = patch.lastActivityAt ?? now;
    }

    return updateLeadForAdvisor(advisorUserId, id, {
      ...patch,
      fullName: merged.fullName,
      mobile: merged.mobile,
      city: merged.city,
      channel: merged.channel,
      serviceType: merged.serviceType,
      priority: merged.priority,
      status: merged.status,
      notes: merged.notes,
      followUpType: merged.followUpType,
      followUpDate: merged.followUpDate,
      followUpTime: merged.followUpTime,
      lastActivityAt: merged.lastActivityAt,
      convertedAt: merged.convertedAt,
    });
  }

  const leads = await listLeadsWithSync(advisorUserId);
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
  await saveLeadsJson(next);
  return updated;
}

export async function deleteLead(advisorUserId: string, id: string): Promise<boolean> {
  if (useSupabasePersistence()) {
    return deleteLeadForAdvisor(advisorUserId, id);
  }

  const leads = await listLeadsWithSync(advisorUserId);
  const next = leads.filter((l) => l.id !== id);
  if (next.length === leads.length) return false;
  await saveLeadsJson(next);
  return true;
}

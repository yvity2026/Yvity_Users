import type { ContactInquiry } from "@/lib/contact-config";
import fs from "fs/promises";
import path from "path";
import { filterContactInquiriesForAdvisor } from "@/lib/server/contact-inquiry-limits";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import {
  appendContactInquiryToDb,
  loadContactInquiriesFromDb,
} from "@/lib/server/supabase/telemetry-supabase";

const DATA_DIR = path.join(process.cwd(), ".data");
const INQUIRIES_FILE = path.join(DATA_DIR, "contact-inquiries.json");

async function loadContactInquiriesJson(): Promise<ContactInquiry[]> {
  try {
    const raw = await fs.readFile(INQUIRIES_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ContactInquiry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveContactInquiriesJson(list: ContactInquiry[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(INQUIRIES_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export async function loadContactInquiries(advisorUserId?: string): Promise<ContactInquiry[]> {
  if (useSupabasePersistence() && advisorUserId) {
    return loadContactInquiriesFromDb(advisorUserId);
  }

  const list = await loadContactInquiriesJson();
  if (!advisorUserId) return list;
  return filterContactInquiriesForAdvisor(advisorUserId, list);
}

export async function appendContactInquiry(
  advisorUserId: string,
  inquiry: Omit<ContactInquiry, "id" | "createdAt" | "advisorUserId">,
): Promise<ContactInquiry> {
  if (useSupabasePersistence()) {
    return appendContactInquiryToDb(advisorUserId, inquiry);
  }

  const list = await loadContactInquiriesJson();
  const entry: ContactInquiry = {
    ...inquiry,
    advisorUserId,
    id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  await saveContactInquiriesJson([...list, entry]);
  return entry;
}

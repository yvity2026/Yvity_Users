import fs from "fs/promises";
import path from "path";
import type { ContactInquiry } from "@/lib/contact-config";

const DATA_DIR = path.join(process.cwd(), ".data");
const INQUIRIES_FILE = path.join(DATA_DIR, "contact-inquiries.json");

export async function loadContactInquiries(): Promise<ContactInquiry[]> {
  try {
    const raw = await fs.readFile(INQUIRIES_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ContactInquiry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendContactInquiry(
  inquiry: Omit<ContactInquiry, "id" | "createdAt">,
): Promise<ContactInquiry> {
  const list = await loadContactInquiries();
  const entry: ContactInquiry = {
    ...inquiry,
    id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(INQUIRIES_FILE, JSON.stringify([...list, entry], null, 2), "utf-8");
  return entry;
}

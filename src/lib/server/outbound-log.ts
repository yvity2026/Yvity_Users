import "server-only";

import { canUseLocalDataFiles, loadJsonFile, saveJsonFile } from "@/lib/server/json-store";

export type OutboundLogEntry = {
  id: string;
  channel: "email" | "whatsapp";
  to: string;
  subject?: string;
  preview: string;
  status: "sent" | "logged" | "failed";
  error?: string;
  createdAt: string;
};

const OUTBOUND_FILE = "outbound-messages.json";

/** Best-effort local log — never throws (Vercel filesystem is read-only). */
export async function appendOutboundLog(entry: Omit<OutboundLogEntry, "id" | "createdAt">) {
  if (!canUseLocalDataFiles()) {
    console.info("[YVITY outbound]", entry.channel, entry.to, entry.status, entry.preview.slice(0, 120));
    return;
  }

  try {
    const db = await loadJsonFile<{ items: OutboundLogEntry[] }>(OUTBOUND_FILE, { items: [] });
    db.items.unshift({
      ...entry,
      id: `out_${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    await saveJsonFile(OUTBOUND_FILE, db);
  } catch (error) {
    console.warn(
      "[YVITY outbound log skipped]",
      error instanceof Error ? error.message : error,
    );
  }
}

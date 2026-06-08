import fs from "fs/promises";
import path from "path";
import type { ProfileShareKind, ProfileShareRecord } from "@/lib/profile-shares/types";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import {
  appendShareEvent,
  countSelfProfileShares as countSelfSharesDb,
  countSelfProfileSharesInMonth as countSelfSharesMonthDb,
  countUniqueClientProfileSharers as countClientSharersDb,
  countUniqueClientProfileSharersInMonth as countClientSharersMonthDb,
} from "@/lib/server/supabase/share-events-supabase";

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "profile-shares.json");

async function loadProfileSharesJson(): Promise<ProfileShareRecord[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    const parsed = JSON.parse(raw) as ProfileShareRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveProfileSharesJson(list: ProfileShareRecord[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(list, null, 2), "utf-8");
}

export async function loadProfileShares(): Promise<ProfileShareRecord[]> {
  if (useSupabasePersistence()) return [];
  return loadProfileSharesJson();
}

export async function appendProfileShare(input: {
  advisorUserId: string;
  sharerUserId: string;
  kind: ProfileShareKind;
}): Promise<ProfileShareRecord> {
  if (useSupabasePersistence()) {
    await appendShareEvent(input);
    return {
      id: `share_${Date.now()}`,
      advisorUserId: input.advisorUserId,
      sharerUserId: input.sharerUserId,
      kind: input.kind,
      createdAt: new Date().toISOString(),
    };
  }

  const list = await loadProfileSharesJson();
  const entry: ProfileShareRecord = {
    id: `share_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    advisorUserId: input.advisorUserId,
    sharerUserId: input.sharerUserId,
    kind: input.kind,
    createdAt: new Date().toISOString(),
  };
  await saveProfileSharesJson([...list, entry]);
  return entry;
}

export async function countSelfProfileShares(advisorUserId: string): Promise<number> {
  if (useSupabasePersistence()) return countSelfSharesDb(advisorUserId);
  const list = await loadProfileSharesJson();
  return list.filter((row) => row.advisorUserId === advisorUserId && row.kind === "self").length;
}

export async function countUniqueClientProfileSharers(advisorUserId: string): Promise<number> {
  if (useSupabasePersistence()) return countClientSharersDb(advisorUserId);
  const list = await loadProfileSharesJson();
  const sharers = new Set(
    list
      .filter(
        (row) =>
          row.advisorUserId === advisorUserId &&
          row.kind === "client" &&
          row.sharerUserId !== advisorUserId,
      )
      .map((row) => row.sharerUserId),
  );
  return sharers.size;
}

function isInMonth(iso: string, year: number, month: number): boolean {
  const date = new Date(iso);
  return date.getFullYear() === year && date.getMonth() === month;
}

export async function countSelfProfileSharesInMonth(
  advisorUserId: string,
  year: number,
  month: number,
): Promise<number> {
  if (useSupabasePersistence()) return countSelfSharesMonthDb(advisorUserId, year, month);
  const list = await loadProfileSharesJson();
  return list.filter(
    (row) =>
      row.advisorUserId === advisorUserId &&
      row.kind === "self" &&
      isInMonth(row.createdAt, year, month),
  ).length;
}

export async function countUniqueClientProfileSharersInMonth(
  advisorUserId: string,
  year: number,
  month: number,
): Promise<number> {
  if (useSupabasePersistence()) return countClientSharersMonthDb(advisorUserId, year, month);
  const list = await loadProfileSharesJson();
  const sharers = new Set(
    list
      .filter(
        (row) =>
          row.advisorUserId === advisorUserId &&
          row.kind === "client" &&
          row.sharerUserId !== advisorUserId &&
          isInMonth(row.createdAt, year, month),
      )
      .map((row) => row.sharerUserId),
  );
  return sharers.size;
}

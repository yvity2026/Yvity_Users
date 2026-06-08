import fs from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/server/session";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import {
  countSearchAppearancesInMonthDb,
  recordSearchImpressionsInDb,
} from "@/lib/server/supabase/telemetry-supabase";

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "search-impressions.json");

export const SEARCHER_COOKIE = "yvity_searcher";

export type SearchImpressionSource =
  | "api_search"
  | "dashboard_home"
  | "dashboard_explore"
  | "landing_search";

type SearchImpressionRecord = {
  id: string;
  advisorUserId: string;
  searcherKey: string;
  source: SearchImpressionSource;
  appearedAt: string;
};

async function loadRecords(): Promise<SearchImpressionRecord[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    const parsed = JSON.parse(raw) as SearchImpressionRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveRecords(rows: SearchImpressionRecord[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2), "utf-8");
}

function isInMonth(iso: string, year: number, month: number): boolean {
  const date = new Date(iso);
  return date.getFullYear() === year && date.getMonth() === month;
}

function isSameDay(iso: string, year: number, month: number, day: number): boolean {
  const date = new Date(iso);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
}

/** Stable anonymous searcher id for logged-out visitors. */
export async function resolveSearcherKey(): Promise<string> {
  const session = await getSessionUser();
  if (session?.id?.trim()) return session.id.trim();

  const jar = await cookies();
  const existing = jar.get(SEARCHER_COOKIE)?.value?.trim();
  if (existing) return existing;

  return `anon_${crypto.randomUUID()}`;
}

/**
 * Record search-result impressions — one per advisor per searcher per day
 * (prevents duplicate counts from repeated refreshes).
 */
export async function recordSearchImpressions(input: {
  advisorUserIds: string[];
  searcherKey: string;
  source: SearchImpressionSource;
}): Promise<void> {
  if (useSupabasePersistence()) {
    await recordSearchImpressionsInDb(input);
    return;
  }

  const searcherKey = input.searcherKey.trim();
  if (!searcherKey) return;

  const ids = [...new Set(input.advisorUserIds.map((id) => id.trim()).filter(Boolean))];
  if (ids.length === 0) return;

  const rows = await loadRecords();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  let changed = false;

  for (const advisorUserId of ids) {
    const alreadyToday = rows.some(
      (row) =>
        row.advisorUserId === advisorUserId &&
        row.searcherKey === searcherKey &&
        isSameDay(row.appearedAt, year, month, day),
    );
    if (alreadyToday) continue;

    rows.push({
      id: `search_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      advisorUserId,
      searcherKey,
      source: input.source,
      appearedAt: now.toISOString(),
    });
    changed = true;
  }

  if (changed) await saveRecords(rows);
}

export async function countSearchAppearancesInMonth(
  advisorUserId: string,
  year: number,
  month: number,
): Promise<number> {
  if (useSupabasePersistence()) {
    return countSearchAppearancesInMonthDb(advisorUserId, year, month);
  }

  const rows = await loadRecords();
  return rows.filter(
    (row) =>
      row.advisorUserId === advisorUserId && isInMonth(row.appearedAt, year, month),
  ).length;
}

export function formatMonthOverMonthDelta(current: number, previous: number): string {
  if (previous <= 0) {
    return current > 0 ? "+100%" : "0%";
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return "0%";
  return pct > 0 ? `+${pct}%` : `${pct}%`;
}

export async function loadSearchAppearanceStats(
  advisorUserId: string,
  now: Date = new Date(),
): Promise<{ count: number; delta: string }> {
  const year = now.getFullYear();
  const month = now.getMonth();
  const prev = month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };

  const [current, previous] = await Promise.all([
    countSearchAppearancesInMonth(advisorUserId, year, month),
    countSearchAppearancesInMonth(advisorUserId, prev.year, prev.month),
  ]);

  return {
    count: current,
    delta: formatMonthOverMonthDelta(current, previous),
  };
}

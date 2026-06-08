import fs from "fs/promises";
import path from "path";
import {
  emptyDecayLedger,
  monthKey,
  parseMonthKey,
  type MonthlyScoreActivity,
  type ScoreDecayLedger,
} from "@/lib/advisor-score/decay";
import {
  formatMonthOverMonthDelta,
  countSearchAppearancesInMonth,
} from "@/lib/server/search-impressions-persistence";
import {
  countSelfProfileSharesInMonth,
  countUniqueClientProfileSharersInMonth,
} from "@/lib/server/profile-shares-persistence";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import {
  countLoginDaysInMonthDb,
  countUniqueProfileViewsInMonthDb,
  loadScoreDecayLedgerFromDb,
  recordAdvisorLoginDayInDb,
  recordProfileViewInDb,
  saveScoreDecayLedgerToDb,
} from "@/lib/server/supabase/telemetry-supabase";

const DATA_DIR = path.join(process.cwd(), ".data");
const ACTIVITY_FILE = path.join(DATA_DIR, "score-activity.json");
const DECAY_FILE = path.join(DATA_DIR, "score-decay.json");

type ProfileViewRecord = {
  id: string;
  advisorUserId: string;
  viewerKey: string;
  viewedAt: string;
};

type LoginDayRecord = {
  userId: string;
  date: string;
};

type ScoreActivityDb = {
  profileViews: ProfileViewRecord[];
  loginDays: LoginDayRecord[];
};

async function loadActivityDb(): Promise<ScoreActivityDb> {
  try {
    const raw = await fs.readFile(ACTIVITY_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ScoreActivityDb;
    return {
      profileViews: Array.isArray(parsed.profileViews) ? parsed.profileViews : [],
      loginDays: Array.isArray(parsed.loginDays) ? parsed.loginDays : [],
    };
  } catch {
    return { profileViews: [], loginDays: [] };
  }
}

async function saveActivityDb(db: ScoreActivityDb): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ACTIVITY_FILE, JSON.stringify(db, null, 2), "utf-8");
}

async function loadDecayDb(): Promise<ScoreDecayLedger[]> {
  try {
    const raw = await fs.readFile(DECAY_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ScoreDecayLedger[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveDecayDb(rows: ScoreDecayLedger[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DECAY_FILE, JSON.stringify(rows, null, 2), "utf-8");
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(key: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(key);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) - 1 };
}

function isRecordInMonth(iso: string, year: number, month: number): boolean {
  const date = new Date(iso);
  return date.getFullYear() === year && date.getMonth() === month;
}

export async function recordProfileView(input: {
  advisorUserId: string;
  viewerKey: string;
}): Promise<void> {
  if (useSupabasePersistence()) {
    await recordProfileViewInDb(input);
    return;
  }

  const advisorUserId = input.advisorUserId.trim();
  const viewerKey = input.viewerKey.trim();
  if (!advisorUserId || !viewerKey) return;

  const db = await loadActivityDb();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const alreadyCounted = db.profileViews.some(
    (row) =>
      row.advisorUserId === advisorUserId &&
      row.viewerKey === viewerKey &&
      isRecordInMonth(row.viewedAt, year, month),
  );
  if (alreadyCounted) return;

  db.profileViews.push({
    id: `view_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    advisorUserId,
    viewerKey,
    viewedAt: now.toISOString(),
  });
  await saveActivityDb(db);
}

export async function recordAdvisorLoginDay(userId: string): Promise<void> {
  if (useSupabasePersistence()) {
    await recordAdvisorLoginDayInDb(userId);
    return;
  }

  const id = userId.trim();
  if (!id) return;

  const db = await loadActivityDb();
  const today = dateKey(new Date());
  const exists = db.loginDays.some((row) => row.userId === id && row.date === today);
  if (exists) return;

  db.loginDays.push({ userId: id, date: today });
  await saveActivityDb(db);
}

async function countUniqueProfileViewsInMonthJson(
  advisorUserId: string,
  year: number,
  month: number,
): Promise<number> {
  const db = await loadActivityDb();
  const viewers = new Set(
    db.profileViews
      .filter(
        (row) =>
          row.advisorUserId === advisorUserId && isRecordInMonth(row.viewedAt, year, month),
      )
      .map((row) => row.viewerKey),
  );
  return viewers.size;
}

async function countLoginDaysInMonthJson(
  userId: string,
  year: number,
  month: number,
): Promise<number> {
  const db = await loadActivityDb();
  return db.loginDays.filter((row) => {
    if (row.userId !== userId) return false;
    const parsed = parseDateKey(row.date);
    return parsed?.year === year && parsed?.month === month;
  }).length;
}

export async function loadMonthlyScoreActivity(
  advisorUserId: string,
  key: string,
): Promise<MonthlyScoreActivity> {
  const parsed = parseMonthKey(key);
  if (!parsed) {
    return { uniqueProfileViews: 0, selfShares: 0, clientSharers: 0, loginDays: 0 };
  }

  const { year, month } = parsed;
  const countViews = useSupabasePersistence()
    ? countUniqueProfileViewsInMonthDb(advisorUserId, year, month)
    : countUniqueProfileViewsInMonthJson(advisorUserId, year, month);
  const countLogins = useSupabasePersistence()
    ? countLoginDaysInMonthDb(advisorUserId, year, month)
    : countLoginDaysInMonthJson(advisorUserId, year, month);

  const [uniqueProfileViews, selfShares, clientSharers, loginDays] = await Promise.all([
    countViews,
    countSelfProfileSharesInMonth(advisorUserId, year, month),
    countUniqueClientProfileSharersInMonth(advisorUserId, year, month),
    countLogins,
  ]);

  return { uniqueProfileViews, selfShares, clientSharers, loginDays };
}

export async function loadCurrentMonthlyScoreActivity(
  advisorUserId: string,
  now: Date = new Date(),
): Promise<MonthlyScoreActivity> {
  return loadMonthlyScoreActivity(advisorUserId, monthKey(now));
}

export async function loadScoreDecayLedger(advisorUserId: string): Promise<ScoreDecayLedger> {
  if (useSupabasePersistence()) {
    return loadScoreDecayLedgerFromDb(advisorUserId);
  }

  const rows = await loadDecayDb();
  return (
    rows.find((row) => row.advisorUserId === advisorUserId) ?? emptyDecayLedger(advisorUserId)
  );
}

export async function saveScoreDecayLedger(ledger: ScoreDecayLedger): Promise<void> {
  if (useSupabasePersistence()) {
    await saveScoreDecayLedgerToDb(ledger);
    return;
  }

  const rows = await loadDecayDb();
  const index = rows.findIndex((row) => row.advisorUserId === ledger.advisorUserId);
  const next = [...rows];
  if (index >= 0) next[index] = ledger;
  else next.push(ledger);
  await saveDecayDb(next);
}

export async function loadAdvisorPerformanceTelemetry(
  advisorUserId: string,
  now: Date = new Date(),
): Promise<{
  profileViews: number;
  profileViewsDelta: string;
  searchAppearances: number;
  searchDelta: string;
}> {
  const year = now.getFullYear();
  const month = now.getMonth();
  const prev = month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };

  const countViews = (y: number, m: number) =>
    useSupabasePersistence()
      ? countUniqueProfileViewsInMonthDb(advisorUserId, y, m)
      : countUniqueProfileViewsInMonthJson(advisorUserId, y, m);

  const [profileCurrent, profilePrevious, searchCurrent, searchPrevious] = await Promise.all([
    countViews(year, month),
    countViews(prev.year, prev.month),
    countSearchAppearancesInMonth(advisorUserId, year, month),
    countSearchAppearancesInMonth(advisorUserId, prev.year, prev.month),
  ]);

  return {
    profileViews: profileCurrent,
    profileViewsDelta: formatMonthOverMonthDelta(profileCurrent, profilePrevious),
    searchAppearances: searchCurrent,
    searchDelta: formatMonthOverMonthDelta(searchCurrent, searchPrevious),
  };
}

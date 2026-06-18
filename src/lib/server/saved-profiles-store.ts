import fs from "fs";
import path from "path";
import { canUseLocalDataFiles } from "@/lib/server/json-store";

const DATA_DIR = path.join(process.cwd(), ".data");
const SAVED_FILE = path.join(DATA_DIR, "saved-profiles.json");

export type SavedProfileEntry = {
  userId: string;
  advisorProfileId: string;
  createdAt: number;
};

export type SavedProfilesDb = {
  entries: SavedProfileEntry[];
};

let cache: SavedProfilesDb | null = null;

function emptyDb(): SavedProfilesDb {
  return { entries: [] };
}

function ensureDataDir() {
  if (!canUseLocalDataFiles()) return;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {
    // Read-only filesystem (Vercel)
  }
}

export function loadSavedProfilesDb(): SavedProfilesDb {
  if (cache) return cache;

  try {
    ensureDataDir();
    const raw = fs.readFileSync(SAVED_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<SavedProfilesDb>;
    cache = {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    };
  } catch {
    cache = emptyDb();
  }

  return cache;
}

export function saveSavedProfilesDb(next: SavedProfilesDb) {
  cache = next;
  if (!canUseLocalDataFiles()) return;
  ensureDataDir();
  try {
    fs.writeFileSync(SAVED_FILE, JSON.stringify(next, null, 2), "utf-8");
  } catch {
    // Read-only filesystem (Vercel) — in-memory cache is the source of truth
  }
}

export function mutateSavedProfilesDb(mutator: (db: SavedProfilesDb) => void) {
  const db = loadSavedProfilesDb();
  mutator(db);
  saveSavedProfilesDb(db);
}

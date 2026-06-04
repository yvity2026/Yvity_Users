import fs from "fs/promises";
import path from "path";
import { normaliseMobile, type AdvisorRecommendation } from "@/lib/recommendations/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "recommendations.json");

export async function loadRecommendations(): Promise<AdvisorRecommendation[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    const parsed = JSON.parse(raw) as AdvisorRecommendation[];
    if (!Array.isArray(parsed)) return [];
    // Backfill `mobileNormalised` for legacy rows persisted before the
    // duplicate-detection key was introduced. Done in-memory only — the
    // disk copy is rewritten on next `appendRecommendation`.
    return parsed.map((r) => ({
      ...r,
      mobileNormalised: r.mobileNormalised ?? normaliseMobile(r.mobile ?? ""),
      tags: Array.isArray(r.tags) ? r.tags : [],
      verified: Boolean(r.verified),
    }));
  } catch {
    return [];
  }
}

/**
 * True when a *verified* recommendation already exists for the supplied
 * mobile number. Used by the recommendations API to block duplicates —
 * one verified recommendation per submitter.
 */
export async function hasVerifiedRecommendationFromMobile(mobile: string): Promise<boolean> {
  const key = normaliseMobile(mobile);
  if (!key) return false;
  const list = await loadRecommendations();
  return list.some((r) => r.verified && r.mobileNormalised === key);
}

export async function appendRecommendation(
  input: Omit<AdvisorRecommendation, "id" | "createdAt" | "mobileNormalised"> & {
    mobileNormalised?: string;
  },
): Promise<AdvisorRecommendation> {
  const list = await loadRecommendations();
  const entry: AdvisorRecommendation = {
    ...input,
    mobileNormalised: input.mobileNormalised ?? normaliseMobile(input.mobile),
    id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify([...list, entry], null, 2), "utf-8");
  return entry;
}

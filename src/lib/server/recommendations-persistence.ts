import fs from "fs/promises";
import path from "path";
import { normaliseMobile, type AdvisorRecommendation } from "@/lib/recommendations/types";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import {
  appendRecommendationForAdvisor,
  hasVerifiedRecommendationFromMobileForAdvisor,
  loadRecommendationsForAdvisor,
} from "@/lib/server/supabase/recommendations-supabase";

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "recommendations.json");

export async function loadRecommendations(advisorUserId?: string): Promise<AdvisorRecommendation[]> {
  if (useSupabasePersistence() && advisorUserId) {
    return loadRecommendationsForAdvisor(advisorUserId);
  }

  try {
    const raw = await fs.readFile(FILE, "utf-8");
    const parsed = JSON.parse(raw) as AdvisorRecommendation[];
    if (!Array.isArray(parsed)) return [];
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

export async function hasVerifiedRecommendationFromMobile(
  mobile: string,
  advisorUserId?: string,
): Promise<boolean> {
  if (useSupabasePersistence() && advisorUserId) {
    return hasVerifiedRecommendationFromMobileForAdvisor(advisorUserId, mobile);
  }

  const key = normaliseMobile(mobile);
  if (!key) return false;
  const list = await loadRecommendations();
  return list.some((r) => r.verified && r.mobileNormalised === key);
}

export async function appendRecommendation(
  input: Omit<AdvisorRecommendation, "id" | "createdAt" | "mobileNormalised"> & {
    mobileNormalised?: string;
  },
  advisorUserId?: string,
): Promise<AdvisorRecommendation> {
  if (useSupabasePersistence() && advisorUserId) {
    return appendRecommendationForAdvisor(advisorUserId, input);
  }

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

export async function countVerifiedRecommendations(advisorUserId?: string): Promise<number> {
  const list = await loadRecommendations(advisorUserId);
  return list.filter((row) => row.verified).length;
}

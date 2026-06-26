import "server-only";

import type { CareerData } from "@/lib/career-types";
import { emptyCareerData } from "@/lib/empty-data";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";

function client() {
  const supabase = getAdminClientOrNull();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

export async function loadCareerFromDb(userId: string): Promise<CareerData> {
  const { data, error } = await client()
    .from("advisor_profiles")
    .select("career_data")
    .eq("advisor_id", userId)
    .maybeSingle();

  if (error) throw new Error(`[career load] ${error.message}`);
  return (data?.career_data as CareerData | null) ?? emptyCareerData;
}

export async function syncCareerToDb(userId: string, career: CareerData): Promise<CareerData> {
  const { error } = await client()
    .from("advisor_profiles")
    .update({ career_data: career, updated_at: new Date().toISOString() })
    .eq("advisor_id", userId);

  if (error) throw new Error(`[career save] ${error.message}`);
  return career;
}

import "server-only";

import {
  normaliseMobile,
  type AdvisorRecommendation,
  type RecommendationTag,
  isRecommendationTag,
} from "@/lib/recommendations/types";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";
import {
  parseRecommendationTags,
  tagsWithRecommendationMeta,
} from "@/lib/server/supabase/gold-meta";

function client() {
  const supabase = getAdminClientOrNull();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

function mapRow(row: Record<string, unknown>): AdvisorRecommendation {
  const rawTags = Array.isArray(row.recommendations) ? (row.recommendations as string[]) : [];
  const { tags: parsedTags, fullName, comment } = parseRecommendationTags(rawTags);
  const tags = parsedTags.filter(isRecommendationTag) as RecommendationTag[];

  return {
    id: String(row.id),
    fullName,
    mobile: String(row.mobile_number || ""),
    mobileNormalised: normaliseMobile(String(row.mobile_number || "")),
    tags,
    comment,
    verified: Boolean(row.is_mobile_verified),
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

export async function loadRecommendationsForAdvisor(
  advisorId: string,
): Promise<AdvisorRecommendation[]> {
  const { data, error } = await client()
    .from("advisor_recommendations")
    .select("*")
    .eq("advisor_id", advisorId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function hasVerifiedRecommendationFromMobileForAdvisor(
  advisorId: string,
  mobile: string,
): Promise<boolean> {
  const key = normaliseMobile(mobile);
  if (!key) return false;

  const { data, error } = await client()
    .from("advisor_recommendations")
    .select("id")
    .eq("advisor_id", advisorId)
    .eq("is_mobile_verified", true)
    .ilike("mobile_number", `%${key}`);

  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}

export async function appendRecommendationForAdvisor(
  advisorId: string,
  input: Omit<AdvisorRecommendation, "id" | "createdAt" | "mobileNormalised"> & {
    mobileNormalised?: string;
  },
): Promise<AdvisorRecommendation> {
  const tags = tagsWithRecommendationMeta(input.tags, {
    fullName: input.fullName,
    comment: input.comment,
  });

  const { data, error } = await client()
    .from("advisor_recommendations")
    .insert({
      advisor_id: advisorId,
      recommendations: tags,
      mobile_number: input.mobileNormalised ?? normaliseMobile(input.mobile),
      is_mobile_verified: input.verified,
      status: "approved",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function countVerifiedRecommendationsForAdvisor(advisorId: string): Promise<number> {
  const { count, error } = await client()
    .from("advisor_recommendations")
    .select("id", { count: "exact", head: true })
    .eq("advisor_id", advisorId)
    .eq("is_mobile_verified", true);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

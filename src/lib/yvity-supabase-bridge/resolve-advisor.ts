import "server-only";

import { ValidateAdvisor } from "@/lib/auth/ValidateAdvisor";
import { resolvePublicAdvisorId } from "@/lib/advisor/resolvePublicAdvisorId";
import { createAdminClient } from "@/lib/supabase/adminClient";

/** Advisor user id for authenticated workspace or public `?advisorId=` slug/uuid. */
export async function resolveAdvisorIdForGoldRequest(
  request: Request,
): Promise<string | null> {
  const sessionAdvisor = await ValidateAdvisor();
  if (sessionAdvisor?.id) {
    return sessionAdvisor.id;
  }

  const advisorKey = new URL(request.url).searchParams.get("advisorId");
  if (!advisorKey) {
    return null;
  }

  const supabase = createAdminClient();
  return resolvePublicAdvisorId(supabase, advisorKey);
}

export async function resolveAdvisorProfileForGoldRequest(request: Request) {
  const advisorId = await resolveAdvisorIdForGoldRequest(request);
  if (!advisorId) return null;

  const supabase = createAdminClient();
  const { data: profile, error } = await supabase
    .from("advisor_profiles")
    .select("*")
    .eq("advisor_id", advisorId)
    .maybeSingle();

  if (error) throw error;
  return profile;
}

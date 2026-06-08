import "server-only";

import { NextResponse } from "next/server";
import { normaliseMobile } from "@/lib/recommendations/types";
import {
  loadPublicViewAdvisorByUserId,
  resolveAdvisorDataUserId,
} from "@/lib/server/public-view-context";
import { getSessionUser } from "@/lib/server/session";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";

export const ADVISOR_SELF_TESTIMONIAL_MESSAGE =
  "You cannot give a testimonial on your own profile.";

export const ADVISOR_SELF_RECOMMENDATION_MESSAGE =
  "You cannot give a recommendation on your own profile.";

async function loadAdvisorMobile(advisorUserId: string): Promise<string | null> {
  if (useSupabasePersistence()) {
    const supabase = getAdminClientOrNull();
    if (supabase) {
      const { data, error } = await supabase
        .from("users")
        .select("mobile")
        .eq("id", advisorUserId)
        .maybeSingle();
      if (!error && data?.mobile) return String(data.mobile);
    }
  }

  const payload = await loadPublicViewAdvisorByUserId(advisorUserId);
  return payload?.phone?.trim() || null;
}

/** True when the submitter is the advisor who owns the viewed profile. */
export async function isAdvisorSelfSubmission(
  advisorUserId: string,
  submitterMobile: string,
): Promise<boolean> {
  const session = await getSessionUser();
  if (session?.id && session.id === advisorUserId) return true;

  const advisorMobile = await loadAdvisorMobile(advisorUserId);
  if (!advisorMobile) return false;

  const submitter = normaliseMobile(submitterMobile);
  const owner = normaliseMobile(advisorMobile);
  if (submitter.length < 10 || owner.length < 10) return false;
  return submitter === owner;
}

export async function rejectAdvisorSelfSubmission(
  advisorUserId: string,
  submitterMobile: string,
  message: string,
): Promise<Response | null> {
  if (!(await isAdvisorSelfSubmission(advisorUserId, submitterMobile))) return null;
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function rejectAdvisorSelfSubmissionForCurrentProfile(
  submitterMobile: string,
  message: string,
): Promise<Response | null> {
  const advisorUserId = await resolveAdvisorDataUserId();
  if (!advisorUserId) return null;
  return rejectAdvisorSelfSubmission(advisorUserId, submitterMobile, message);
}

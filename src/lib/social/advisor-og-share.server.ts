import { toPublicProfileSlugSegment } from "@/lib/advisor/public-profile-slug";
import { loadPublicViewAdvisorBySlug } from "@/lib/server/public-view-context";
import {
  buildAdvisorOgShareContext,
  type AdvisorOgShareContext,
} from "@/lib/social/advisor-og-share";

export async function loadAdvisorOgShareContext(
  advisorSlug: string,
): Promise<AdvisorOgShareContext | null> {
  const segment = toPublicProfileSlugSegment(advisorSlug);
  if (!segment) return null;

  const payload = await loadPublicViewAdvisorBySlug(segment);
  if (!payload) return null;

  return buildAdvisorOgShareContext(payload, segment);
}

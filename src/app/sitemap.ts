import type { MetadataRoute } from "next";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { buildPublicProfilePath } from "@/lib/advisor/public-profile-slug";
import { loadAllAdvisorProfiles } from "@/lib/server/advisor-profile-store";
import { getSiteOrigin } from "@/lib/social/site-origin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteOrigin();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: origin, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    const db = await loadAllAdvisorProfiles();
    const advisorRoutes = Object.values(db.profiles)
      .filter((profile) => isAdvisorProfileApproved(profile) && profile.profile_slug?.trim())
      .map((profile) => ({
        url: `${origin}${buildPublicProfilePath(profile.profile_slug)}`,
        lastModified: profile.approved_at ? new Date(profile.approved_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    return [...staticRoutes, ...advisorRoutes];
  } catch {
    return staticRoutes;
  }
}

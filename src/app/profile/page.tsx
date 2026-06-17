export const dynamic = "force-dynamic";
export const revalidate = 0;

import { ProfileHomeHero } from "@/components/home/profile-home-hero";
import { PublicProfileViewProvider } from "@/context/public-profile-view-context";
import { buildAdvisorPublicProfilePath } from "@/lib/public-profile-url";
import { getAdvisorProfileForUser } from "@/lib/server/advisor-profile-store";
import { getSessionUser } from "@/lib/server/session";
import { loadPublicViewAdvisorByUserId } from "@/lib/server/public-view-context";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Advisor profile | YVITY",
  description: "Verified insurance advisor on YVITY",
};

/** `/profile` — redirect logged-in advisors to their slug URL.
 *  If no slug yet, renders public profile with correct SSR data. */
export default async function PublicProfileHomePage() {
  const session = await getSessionUser();

  if (!session?.id) {
    redirect("/");
  }

  const record = await getAdvisorProfileForUser(session.id);

  // If advisor has a slug, always redirect to canonical URL
  if (record?.profile_slug) {
    redirect(buildAdvisorPublicProfilePath(record.profile_slug));
  }

  // No slug yet — render with proper data context so score, photo, badges are correct
  const payload = await loadPublicViewAdvisorByUserId(session.id);

  if (!payload) {
    redirect("/dashboard");
  }

  return (
    <PublicProfileViewProvider value={payload}>
      <main className="relative flex min-h-[calc(100dvh-4rem)] max-md:min-h-[calc(100dvh-4rem-5.25rem)] flex-col overflow-x-hidden">
        <ProfileHomeHero />
      </main>
    </PublicProfileViewProvider>
  );
}

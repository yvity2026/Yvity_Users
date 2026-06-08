import { ProfileHomeHero } from "@/components/home/profile-home-hero";
import { buildAdvisorPublicProfilePath } from "@/lib/public-profile-url";
import { getAdvisorProfileForUser } from "@/lib/server/advisor-profile-store";
import { getSessionUser } from "@/lib/server/session";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Advisor profile | YVITY",
  description: "Verified insurance advisor on YVITY",
};

/** Legacy `/profile` — redirect logged-in advisors to their slug URL. */
export default async function PublicProfileHomePage() {
  const session = await getSessionUser();
  if (session?.id) {
    const record = await getAdvisorProfileForUser(session.id);
    if (record?.profile_slug) {
      redirect(buildAdvisorPublicProfilePath(record.profile_slug));
    }
  }

  return (
    <main className="relative flex min-h-[calc(100dvh-4rem)] max-md:min-h-[calc(100dvh-4rem-5.25rem)] flex-col overflow-x-hidden">
      <ProfileHomeHero />
    </main>
  );
}

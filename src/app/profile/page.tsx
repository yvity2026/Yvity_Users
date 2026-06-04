import type { Metadata } from "next";
import { ProfileHomeHero } from "@/components/home/profile-home-hero";
import { advisorProfile } from "@/lib/advisor-profile";

export const metadata: Metadata = {
  title: advisorProfile.name,
  description: `${advisorProfile.title}. ${advisorProfile.ctaDescription}`,
  openGraph: {
    title: `${advisorProfile.name} — YVITY`,
    description: advisorProfile.ctaDescription,
  },
};

/** Public advisor profile home (visitor view) — moved from `/` when marketing landing shipped. */
export default function PublicProfileHomePage() {
  return (
    <main className="relative flex min-h-[calc(100dvh-4rem)] max-md:min-h-[calc(100dvh-4rem-5.25rem)] flex-col overflow-x-hidden">
      <ProfileHomeHero />
    </main>
  );
}

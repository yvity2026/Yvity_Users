import { ProfileHomeHero } from "@/components/home/profile-home-hero";
import { findAdvisorByPublicSlug } from "@/lib/advisors/find-advisor-by-slug";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const advisor = await findAdvisorByPublicSlug(slug);

  if (!advisor) {
    return { title: "Advisor profile | YVITY" };
  }

  return {
    title: `${advisor.name} | YVITY`,
    description: `${advisor.title} — ${advisor.location}`,
  };
}

export default async function PublicAdvisorSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const advisor = await findAdvisorByPublicSlug(slug);

  if (!advisor) {
    redirect("/profile");
  }

  const target = advisor.profileUrl?.trim() || "/profile";
  const currentPath = `/Advisor/${slug}`;

  if (target !== currentPath && target !== "/profile") {
    redirect(target);
  }

  return (
    <main className="relative flex min-h-[calc(100dvh-4rem)] max-md:min-h-[calc(100dvh-4rem-5.25rem)] flex-col overflow-x-hidden">
      <ProfileHomeHero />
    </main>
  );
}

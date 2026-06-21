export const dynamic = "force-dynamic";
export const revalidate = 0;

import { ProfileHomeHero } from "@/components/home/profile-home-hero";
import { PublicProfileViewProvider } from "@/context/public-profile-view-context";
import { isReservedPublicProfileSlug } from "@/lib/advisor/public-profile-slug";
import {
  isAdvisorProfileLive,
  loadPublicViewAdvisorBySlug,
} from "@/lib/server/public-view-context";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/server/session";
import { buildAdvisorPublicProfileMetadata } from "@/lib/social/advisor-public-profile-metadata";
import { buildAdvisorProfileJsonLd } from "@/lib/social/advisor-json-ld";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (isReservedPublicProfileSlug(slug)) {
    return { title: "Advisor profile" };
  }

  const payload = await loadPublicViewAdvisorBySlug(slug);
  if (!payload) return { title: "Advisor profile" };

  return buildAdvisorPublicProfileMetadata(payload, slug);
}

export default async function AdvisorPublicProfilePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;

  if (isReservedPublicProfileSlug(slug)) {
    notFound();
  }

  const payload = await loadPublicViewAdvisorBySlug(slug);
  if (!payload) {
    notFound();
  }

  const isPreview = preview === "public";
  const live = isAdvisorProfileLive(payload.profile);
  const session = await getSessionUser();
  const isOwner = session?.id === payload.userId;

  if (!live && !isPreview && !isOwner) {
    notFound();
  }

  const jsonLd = buildAdvisorProfileJsonLd(payload, slug);

  return (
    <PublicProfileViewProvider value={payload}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="relative flex min-h-[calc(100dvh-4rem)] max-md:min-h-[calc(100dvh-4rem-5.25rem)] flex-col overflow-x-hidden pt-6 sm:pt-8 lg:pt-12">
        <ProfileHomeHero />
      </main>
    </PublicProfileViewProvider>
  );
}

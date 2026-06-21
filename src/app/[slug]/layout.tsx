import { PublicProfileViewProvider } from "@/context/public-profile-view-context";
import { isReservedPublicProfileSlug } from "@/lib/advisor/public-profile-slug";
import { loadPublicViewAdvisorBySlug } from "@/lib/server/public-view-context";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SlugLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (isReservedPublicProfileSlug(slug)) notFound();

  const payload = await loadPublicViewAdvisorBySlug(slug);
  // If advisor doesn't exist at all → 404. Live/preview checks remain in each page.
  if (!payload) notFound();

  return (
    <PublicProfileViewProvider value={payload}>
      {children}
    </PublicProfileViewProvider>
  );
}

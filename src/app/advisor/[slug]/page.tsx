import { buildPublicProfilePath } from "@/lib/advisor/public-profile-slug";
import { toPublicProfileSlugSegment } from "@/lib/advisor/public-profile-slug";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Legacy `/Advisor/...` URLs → canonical `/{slug}`. */
export default async function LegacyAdvisorSlugRedirect({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const segment = toPublicProfileSlugSegment(slug);
  const base = buildPublicProfilePath(segment || slug);
  const paramsObj = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") paramsObj.set(key, value);
    else if (Array.isArray(value)) value.forEach((v) => paramsObj.append(key, v));
  }
  const qs = paramsObj.toString();
  redirect(qs ? `${base}?${qs}` : base);
}

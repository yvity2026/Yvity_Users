import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/social/site-origin";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/advisor/", "/api/", "/edit/"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}

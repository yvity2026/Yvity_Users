import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YVITY — Credibility Platform",
    short_name: "YVITY",
    description: "India's First Credibility Platform for Insurance Advisors",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0A4A4A",
    theme_color: "#0A4A4A",
    lang: "en-IN",
    categories: ["business", "finance"],
    icons: [
      {
        src: "/brand/yvity-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/yvity-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/yvity-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

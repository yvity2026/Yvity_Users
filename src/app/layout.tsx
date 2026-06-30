import type { Metadata, Viewport } from "next";
import { PublicProfileFooterLayout } from "@/components/public-profile-footer-layout";
import { SiteChrome } from "@/components/site-chrome";
import { Providers } from "@/components/providers";
import { PwaInit } from "@/components/pwa/pwa-init";
import { AddToHomeScreenBanner } from "@/components/pwa/add-to-home-screen-banner";
import { brandFontClassName } from "@/lib/brand-fonts";
import { COMPANY_NAME } from "@/lib/brand";
import { platformOpenGraphImage } from "@/lib/social/platform-public-metadata";
import { getSiteOrigin } from "@/lib/social/site-origin";
import "./globals.css";
import "./yvity-landing.css";

export const viewport: Viewport = {
  themeColor: "#0A4A4A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: {
    default: `${COMPANY_NAME} — India's First Credibility Platform for Insurance Advisors`,
    template: `%s — ${COMPANY_NAME}`,
  },
  description:
    "Find verified, IRDAI-ready insurance advisors near you — or build your own credible profile that speaks before you do. Free to join. Trusted by advisors & clients across India.",
  icons: {
    icon: "/brand/yvity-logo.png",
    apple: "/brand/yvity-logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "YVITY",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: `${COMPANY_NAME} — India's First Credibility Platform for Insurance Advisors`,
    description:
      "Find verified, IRDAI-ready insurance advisors near you — or build your own credible profile that speaks before you do. Free to join. Trusted by advisors & clients across India.",
    type: "website",
    images: [platformOpenGraphImage()],
  },
  twitter: {
    card: "summary_large_image",
    title: `${COMPANY_NAME} — India's First Credibility Platform for Insurance Advisors`,
    description:
      "Find verified, IRDAI-ready insurance advisors near you — or build your own credible profile that speaks before you do. Free to join. Trusted by advisors & clients across India.",
    images: [platformOpenGraphImage().url],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-profile-theme="warm-ivory" className={brandFontClassName}>
      <body>
        <Providers>
          <SiteChrome />
          {children}
          <PublicProfileFooterLayout />
          <AddToHomeScreenBanner />
        </Providers>
        <PwaInit />
      </body>
    </html>
  );
}

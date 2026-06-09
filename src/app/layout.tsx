import type { Metadata } from "next";
import { PublicProfileFooterLayout } from "@/components/public-profile-footer-layout";
import { SiteChrome } from "@/components/site-chrome";
import { Providers } from "@/components/providers";
import { brandFontClassName } from "@/lib/brand-fonts";
import { COMPANY_NAME, COMPANY_TAGLINE } from "@/lib/brand";
import { platformOpenGraphImage } from "@/lib/social/platform-public-metadata";
import { getSiteOrigin } from "@/lib/social/site-origin";
import "./globals.css";
import "./yvity-landing.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: {
    default: `${COMPANY_NAME} — ${COMPANY_TAGLINE}`,
    template: `%s — ${COMPANY_NAME}`,
  },
  description: `${COMPANY_TAGLINE}. Premium, verified career profiles for advisors and professionals.`,
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: `${COMPANY_NAME} — ${COMPANY_TAGLINE}`,
    description: `${COMPANY_TAGLINE}. Verified career profiles built for advisors and professionals.`,
    type: "website",
    images: [platformOpenGraphImage()],
  },
  twitter: {
    card: "summary_large_image",
    title: `${COMPANY_NAME} — ${COMPANY_TAGLINE}`,
    description: `${COMPANY_TAGLINE}. Verified career profiles built for advisors and professionals.`,
    images: [platformOpenGraphImage().url],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-profile-theme="signature-dark" className={brandFontClassName}>
      <body>
        <Providers>
          <SiteChrome />
          {children}
          <PublicProfileFooterLayout />
        </Providers>
      </body>
    </html>
  );
}

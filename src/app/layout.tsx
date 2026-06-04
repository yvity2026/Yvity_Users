import type { Metadata } from "next";
import { PublicProfileFooterLayout } from "@/components/public-profile-footer-layout";
import { SiteChrome } from "@/components/site-chrome";
import { Providers } from "@/components/providers";
import { brandFontClassName } from "@/lib/brand-fonts";
import { COMPANY_LOGO_PATH, COMPANY_NAME, COMPANY_TAGLINE } from "@/lib/brand";
import "./globals.css";
import "./yvity-landing.css";

export const metadata: Metadata = {
  title: {
    default: `${COMPANY_NAME} — ${COMPANY_TAGLINE}`,
    template: `%s — ${COMPANY_NAME}`,
  },
  description: `${COMPANY_TAGLINE}. Premium, verified career profiles for advisors and professionals.`,
  icons: {
    icon: COMPANY_LOGO_PATH,
    apple: COMPANY_LOGO_PATH,
  },
  openGraph: {
    title: `${COMPANY_NAME} — ${COMPANY_TAGLINE}`,
    description: `${COMPANY_TAGLINE}. Verified career profiles built for advisors and professionals.`,
    type: "website",
    images: [{ url: COMPANY_LOGO_PATH, alt: `${COMPANY_NAME} logo` }],
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

"use client";
/* eslint-disable react/no-unescaped-entities */
import BrandMark from "@/yvity-landing/components/brand/BrandMark";
import { FaArrowRight } from "react-icons/fa";
import { scrollToSection } from "@/yvity-landing/lib/landing/scrollToSection";
import { openLoginModal } from "@/yvity-landing/lib/ui/openLoginModal";
import { openRegistrationModal } from "@/yvity-landing/lib/ui/openRegistrationModal";
import { usePathname, useRouter } from "next/navigation";
import { LANDING_INNER } from "@/yvity-landing/app/components/home/landingLayout";
import { useLandingMobileNavOptional } from "@/yvity-landing/app/components/home/LandingMobileNavContext";

const MOBILE_PANEL_SECTIONS = new Set([
  "how-it-works",
  "find-advisors",
  "testimonials",
  "pricing",
  "faq",
]);

const FOOTER_FONT = "font-poppins";

function FooterSectionTitle({ children }) {
  return (
    <h2
      className={`${FOOTER_FONT} text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F59E0B] lg:text-left`}
    >
      {children}
    </h2>
  );
}

function FooterLinkButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${FOOTER_FONT} w-full text-center text-[11px] font-normal leading-snug text-[#9EB8B8] transition-colors hover:text-[#F8F6F1] sm:text-[12px] lg:text-left lg:text-[13px]`}
    >
      {label}
    </button>
  );
}

const Footer = () => {
  const router = useRouter();
  const pathname = usePathname();
  const mobileNav = useLandingMobileNavOptional();

  const platformLinks = [
    { name: "Find Advisors", link: "find-advisors" },
    { name: "How YVITY Works", link: "how-it-works" },
    { name: "Reviews", link: "testimonials" },
    { name: "Pricing", link: "pricing" },
    { name: "FAQ", link: "faq" },
  ];

  const advisorLinks = [
    { name: "Build Your Profile", action: "register" },
    { name: "Advisor Login", action: "login" },
  ];

  const companyLinks = [
    { name: "About YVITY", link: "/about" },
    { name: "Contact Us", link: "/contact" },
    { name: "Privacy Policy", link: "/privacy-policy" },
    { name: "Terms & Conditions", link: "/terms-and-conditions" },
  ];

  const navigateToSection = (sectionId) => {
    const isMobilePanel =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches &&
      MOBILE_PANEL_SECTIONS.has(sectionId);

    if (pathname === "/" && isMobilePanel && mobileNav) {
      mobileNav.openPanel(sectionId);
      return;
    }

    if (pathname === "/") {
      scrollToSection(sectionId);
      return;
    }

    router.push(`/#${sectionId}`);
  };

  const handlePlatformClick = (subitem) => {
    navigateToSection(subitem.link);
  };

  const handleAdvisorClick = (subitem) => {
    if (subitem.action === "register") {
      openRegistrationModal();
      return;
    }
    openLoginModal();
  };

  const handleCompanyClick = (subitem) => {
    router.push(subitem.link);
  };

  return (
    <footer
      className={`${FOOTER_FONT} w-full border-t border-[#0AE0E0]/10 bg-[#003234] py-8 lg:py-12`}
    >
      <div className={`${LANDING_INNER} flex w-full flex-col gap-6 lg:gap-10`}>
        <div className="flex flex-col items-center gap-5 text-center lg:grid lg:grid-cols-2 lg:items-start lg:gap-16 lg:text-left xl:gap-24">
          <div className="flex w-full flex-col items-center gap-3 lg:items-start lg:gap-4">
            <BrandMark
              logoSize={48}
              showName
              showTagline
              layout="row"
              className="items-center justify-center lg:justify-start"
              logoClassName="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14 rounded-full bg-[#f8f6f1] p-1.5 shadow-sm"
              nameClassName={`${FOOTER_FONT} text-center text-xl font-bold leading-none text-[#F8F6F1] sm:text-2xl lg:text-left`}
              taglineClassName={`${FOOTER_FONT} text-center text-[11px] font-semibold text-(--ct-as-badges-accents,#F59E0B) sm:text-sm lg:text-left`}
            />

            <p className="max-w-md text-[12px] leading-relaxed text-[#C0C0C0] sm:text-sm">
              India&apos;s first credibility platform for insurance advisors — one
              verified profile that proves Identity, Visibility, and Trust to
              every client.
            </p>

            <button
              type="button"
              onClick={openRegistrationModal}
              className={`${FOOTER_FONT} flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-[#0A4A4A] px-5 py-2.5 text-sm font-bold text-(--ct-as-badges-accents,#F59E0B) shadow-[0_4px_16px_rgba(10,74,74,0.45)] ring-1 ring-[#F59E0B]/35 transition-transform active:scale-[0.98] lg:hidden`}
            >
              Build Your Profile
              <FaArrowRight className="text-xs" />
            </button>
          </div>

          <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-4 lg:mx-0 lg:max-w-none lg:gap-8">
            <div className="flex flex-col items-center gap-2.5 lg:items-start">
              <FooterSectionTitle>Platform</FooterSectionTitle>
              <ul className="flex flex-col gap-2">
                {platformLinks.map((item) => (
                  <li key={item.link}>
                    <FooterLinkButton
                      label={item.name}
                      onClick={() => handlePlatformClick(item)}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-center gap-2.5 lg:items-start">
              <FooterSectionTitle>For Advisors</FooterSectionTitle>
              <ul className="flex flex-col gap-2">
                {advisorLinks.map((item) => (
                  <li key={item.name}>
                    <FooterLinkButton
                      label={item.name}
                      onClick={() => handleAdvisorClick(item)}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-center gap-2.5 lg:items-start">
              <FooterSectionTitle>Company</FooterSectionTitle>
              <ul className="flex flex-col gap-2">
                {companyLinks.map((item) => (
                  <li key={item.link}>
                    <FooterLinkButton
                      label={item.name}
                      onClick={() => handleCompanyClick(item)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={`${LANDING_INNER} mt-6 border-t border-[#0AE0E0]/12 pt-5 lg:mt-10 lg:pt-6`}>
        <div className="flex flex-col items-center justify-between gap-2 text-center text-[10px] leading-relaxed text-[#7A9494] sm:text-[11px] lg:flex-row lg:items-center lg:text-left lg:text-xs">
          <p>
            &copy; 2026 Medhaara Innovations Private Limited. All rights
            reserved.
          </p>
          <p>A brand of Medhaara Innovations Pvt Ltd</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

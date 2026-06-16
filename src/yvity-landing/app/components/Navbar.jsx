"use client";
import React, { useEffect } from "react";
import BrandMark from "@/yvity-landing/components/brand/BrandMark";
import { scrollToSection } from "@/yvity-landing/lib/landing/scrollToSection";
import { openLoginModal } from "@/yvity-landing/lib/ui/openLoginModal";
import { openRegistrationModal } from "@/yvity-landing/lib/ui/openRegistrationModal";
import { LANDING_NAV_INNER } from "@/yvity-landing/app/components/home/landingLayout";

const Navitems = [
  { name: "Home", link: "home" },
  { name: "How it Works", link: "how-it-works" },
  { name: "Find Advisors", link: "find-advisors" },
  { name: "Reviews", link: "testimonials" },
  { name: "Pricing", link: "pricing" },
];

export { scrollToSection };

const Navbar = ({ initialLoginOpen = false }) => {

  useEffect(() => {
    if (initialLoginOpen) {
      openLoginModal();
    }
  }, [initialLoginOpen]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("login") === "true") {
      params.delete("login");
      params.delete("reason");
      params.delete("next");

      const query = params.toString();
      const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
      window.history.replaceState(null, "", nextUrl);
      openLoginModal();
    }
  }, []);

  const goLogin = () => openLoginModal();
  const goRegister = () => openRegistrationModal();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 m-0 p-0">
      {/* Mobile: square top, rounded bottom, gradient border */}
      <div className="mob-nav-top-frame lg:hidden">
        <div className="glass-nav-mobile mob-nav-top-inner">
          <div className={`${LANDING_NAV_INNER} flex h-[3.75rem] items-center justify-between sm:h-16`}>
            <div className="flex min-w-0 items-center justify-start">
              <BrandMark
                logoSize={40}
                showName
                showTagline
                logoClassName="h-10 w-10 object-contain"
                nameClassName="font-cormorant text-base font-bold leading-none text-[#0A4A4A]"
                taglineClassName="font-poppins text-[10px] font-semibold leading-tight text-[#F59E0B]"
              />
            </div>
            <button
              type="button"
              onClick={goLogin}
              className="relative flex h-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#0A4A4A] via-[#0D5555] to-[#0A4A4A] px-4 font-poppins shadow-[0_4px_16px_rgba(10,74,74,0.2),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-[#F59E0B]/40 transition-transform duration-200 active:scale-95 sm:h-10 sm:px-5"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"
              />
              <span className="relative text-[13px] font-bold leading-none tracking-wide text-[#F59E0B] sm:text-sm">
                Login
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: flush to viewport top — no extra band above the pill nav */}
      <div className="app-top-nav-desktop-wrap hidden lg:block">
        <div className={LANDING_NAV_INNER}>
          <div className="glass-nav-frame relative flex h-17.5 w-full items-center justify-between rounded-[100px] p-[1px]">
            <div className="glass-nav-desktop relative z-10 flex h-full w-full items-center justify-between rounded-[100px] px-6 py-4 lg:px-8 xl:px-10">
              <div className="relative z-10 flex shrink-0 items-center">
                <BrandMark
                  logoSize={48}
                  showName
                  showTagline
                  logoClassName="h-12 w-12 object-contain"
                  nameClassName="font-cormorant text-xl font-bold leading-none text-[#0A4A4A]"
                  taglineClassName="font-poppins text-[10px] font-semibold leading-tight text-[#F59E0B] sm:text-[11px]"
                />
              </div>

              <ul className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-4 font-poppins text-[#0A4A4A] md:text-xs lg:text-sm xl:gap-8 xl:text-[15px]">
                {Navitems.map((item, index) => (
                  <li key={index} className="pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => scrollToSection(item.link)}
                      className="group relative inline-block cursor-pointer whitespace-nowrap bg-transparent p-0 font-inherit text-[#0A4A4A] transition-colors hover:text-[#D97706]"
                    >
                      {item.name}
                      <span className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-[#F59E0B] transition-all duration-500 ease-out group-hover:left-0 group-hover:w-full" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="relative z-10 flex shrink-0 items-center gap-3 font-poppins font-medium lg:gap-4">
                <button
                  type="button"
                  onClick={goLogin}
                  className="relative flex h-9.5 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#0A4A4A] via-[#0D5555] to-[#0A4A4A] px-5.5 py-3.5 text-sm font-bold leading-none shadow-[0_4px_16px_rgba(10,74,74,0.2),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-[#F59E0B]/40 transition-all duration-300 hover:shadow-[0_0_16px_3px_rgba(245,158,11,0.18)] active:scale-[0.98]"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"
                  />
                  <span className="relative text-[#F59E0B]">Login</span>
                </button>
                <button
                  onClick={goRegister}
                  className="flex h-9.5 items-center justify-center gap-2.5 rounded-3xl bg-[#F59E0B] px-5.5 py-3.5 text-sm font-bold leading-normal text-[#0A4A4A] shadow-[0_4px_14px_rgba(244,159,15,0.4)] ring-1 ring-[#FFAE26]/50 transition-all hover:bg-[#FFAE26] hover:shadow-[0_4px_18px_rgba(245,158,11,0.45)]"
                >
                  Join Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

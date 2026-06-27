"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  X,
  Home,
  Briefcase,
  Sparkles,
  Trophy,
  Quote,
  Image as ImageIcon,
  LogIn,
  LayoutDashboard,
} from "lucide-react";
import { useEffect, useState } from "react";
import BrandMark from "@/components/brand/BrandMark";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";
import { LANDING_PATH } from "@/lib/landing/paths";
import { useShowPublicVisitorNav } from "@/lib/use-public-visitor-nav";
import { usePublicProfileNavHome } from "@/hooks/use-public-profile-nav-home";
import { useVisiblePublicNavLinks } from "@/hooks/use-visible-public-nav-links";
import { isPublicAdvisorSlugPath } from "@/lib/advisor/public-profile-slug";
import { ADVISOR_MY_SPACE_DASHBOARD_PATH } from "@/lib/dashboard/advisorWorkspace";

function navLinkClass(active: boolean, base: string) {
  return cn(base, active && "yvity-dash-nav-link--active");
}

function isActivePath(pathname: string, href: string, homeHref: string) {
  // Home link — matches the slug home path or /profile
  if (href === homeHref || href === "/profile") {
    return pathname === "/profile" || isPublicAdvisorSlugPath(pathname) || pathname === homeHref;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthed } = useAuth();
  const showVisitorNav = useShowPublicVisitorNav();
  const showAuthed = isAuthed && !showVisitorNav;
  const homeHref = usePublicProfileNavHome();
  const links = useVisiblePublicNavLinks();

  useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = expanded ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [expanded]);

  const ctaHref = showAuthed ? ADVISOR_MY_SPACE_DASHBOARD_PATH : LANDING_PATH;
  const ctaLabel = showAuthed ? "Dashboard" : "Login";
  const CtaIcon = showAuthed ? LayoutDashboard : LogIn;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 m-0 p-0 lg:pt-0" data-profile-theme="warm-ivory">
        <div className="mob-nav-top-frame lg:hidden">
          <div className="glass-nav-mobile mob-nav-top-inner">
          <div className="mx-auto flex h-[3.75rem] w-full max-w-[1536px] items-center justify-between px-4 sm:h-16">
            <Link
              href={homeHref}
              className="flex min-w-0 items-center justify-start rounded-lg outline-offset-4 transition-opacity hover:opacity-90"
              aria-label="YVITY home"
            >
              <BrandMark
                logoSize={40}
                showName
                showTagline
                layout="row"
                logoClassName="h-9 w-9 object-contain"
                nameClassName="font-cormorant text-base font-bold leading-none text-[#0A4A4A]"
                taglineClassName="font-poppins text-[10px] font-semibold leading-tight text-[#F59E0B]"
              />
            </Link>

            <button
              type="button"
              onClick={() => router.push(ctaHref)}
              className="relative flex h-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#0A4A4A] via-[#0D5555] to-[#0A4A4A] px-4 font-poppins shadow-[0_4px_16px_rgba(10,74,74,0.2),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-[#F59E0B]/40 transition-transform duration-200 active:scale-95 sm:h-10 sm:px-5 gap-1.5"
            >
              <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
              <CtaIcon className="relative size-3.5 text-[#F59E0B]" />
              <span className="relative text-[13px] font-bold leading-none tracking-wide text-[#F59E0B] sm:text-sm">{ctaLabel}</span>
            </button>
          </div>
          </div>
        </div>

        <div className="app-top-nav-desktop-wrap hidden lg:block">
          <div className="mx-auto w-full max-w-[1536px] px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="glass-nav-frame relative flex h-[4.375rem] w-full items-center justify-between rounded-[100px] p-[1px]">
              <nav className="glass-nav-desktop relative z-10 flex h-full w-full items-center justify-between rounded-[100px] px-6 py-3 lg:px-8 xl:px-10">
                <Link
                  href={homeHref}
                  className="relative z-10 flex shrink-0 items-center rounded-lg outline-offset-4 transition-opacity hover:opacity-90"
                  aria-label="YVITY home"
                >
                  <BrandMark
                    logoSize={40}
                    showName
                    showTagline
                    layout="row"
                    logoClassName="h-9 w-9 object-contain"
                    nameClassName="yvity-dash-nav-brand-name font-cormorant text-base font-bold leading-none xl:text-lg"
                    taglineClassName="yvity-dash-nav-brand-tagline font-poppins text-[10px] font-semibold leading-tight"
                  />
                </Link>

                <ul className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 sm:gap-1">
                  {links.map((l) => (
                    <li key={l.href} className="pointer-events-auto">
                      <Link
                        href={l.href === "/profile" ? homeHref : l.href}
                        className={navLinkClass(
                          isActivePath(pathname, l.href, homeHref),
                          "yvity-dash-nav-link relative rounded-full px-3.5 py-1.5 text-sm font-medium font-poppins transition-colors",
                        )}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => router.push(ctaHref)}
                  className="yvity-dash-nav-cta relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold font-poppins shadow-md active:scale-95 transition hover:opacity-90"
                >
                  <CtaIcon className="size-3.5" /> {ctaLabel}
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Reserve space so fixed header does not overlap page content */}
      <div
        className="h-[calc(3.75rem+env(safe-area-inset-top,0px))] shrink-0 sm:h-[calc(4rem+env(safe-area-inset-top,0px))] lg:h-16"
        aria-hidden
      />

      <MobileBottomBar
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        pathname={pathname}
        homeHref={homeHref}
        servicesHref={homeHref === "/profile" ? "/services" : `${homeHref}/services`}
        testimonialsHref={homeHref === "/profile" ? "/testimonials" : `${homeHref}/testimonials`}
      />

      {expanded && (
        <div
          className="lg:hidden fixed inset-0 z-[55] animate-in fade-in duration-200"
          onClick={() => setExpanded(false)}
        >
          <div className="absolute inset-0 yvity-nav-shell" />
          <div
            className="absolute inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] rounded-3xl glass-strong p-4 animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2 pb-3">
              <BrandMark
                logoSize={32}
                showName
                showTagline
                layout="row"
                nameClassName="yvity-dash-nav-brand-name font-cormorant text-base font-bold"
                taglineClassName="yvity-dash-nav-brand-tagline font-poppins text-[10px]"
              />
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Close menu"
                className="inline-flex size-9 items-center justify-center rounded-full glass"
              >
                <X className="size-4" />
              </button>
            </div>
            <ul className="grid grid-cols-3 gap-2">
              {links.map((l) => {
                const Icon = l.icon;
                const href = l.href === "/profile" ? homeHref : l.href;
                const active = isActivePath(pathname, l.href, homeHref);
                return (
                  <li key={l.href}>
                    <Link
                      href={href}
                      className={cn(
                        "group flex flex-col items-center gap-1.5 rounded-2xl p-3 glass hover:bg-white/5 transition active:scale-95",
                        active && "yvity-nav-active-ring",
                      )}
                    >
                      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/40 to-accent/30 ring-1 ring-white/10 group-hover:scale-105 transition">
                        <Icon className="size-4.5 text-foreground" />
                      </span>
                      <span className="text-[11px] font-medium text-center leading-tight">
                        {l.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
              <li className="col-span-3 mt-1">
                <Link
                  href={ctaHref}
                  className="flex items-center justify-center gap-2 rounded-2xl p-3 bg-primary text-primary-foreground font-semibold text-sm shadow-md shadow-primary/30 active:scale-95 transition"
                >
                  <CtaIcon className="size-4" /> {ctaLabel}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

function MobileBottomBar({
  expanded,
  onToggle,
  pathname,
  homeHref,
  servicesHref,
  testimonialsHref,
}: {
  expanded: boolean;
  onToggle: () => void;
  pathname: string;
  homeHref: string;
  servicesHref: string;
  testimonialsHref: string;
}) {
  const homeActive = isActivePath(pathname, homeHref, homeHref);

  return (
    <nav
      aria-label="Mobile profile navigation"
      data-profile-theme="warm-ivory"
      className="lg:hidden fixed inset-x-0 bottom-0 z-[60]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mob-nav-bottom-frame">
        <div className="glass-nav-mobile mob-nav-bottom-inner">
        <div className="mx-auto flex h-[3.75rem] max-w-lg items-stretch justify-around px-1 sm:h-16">
          <Link
            href={homeHref}
            aria-current={homeActive ? "page" : undefined}
            className="relative flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center px-0.5 active:scale-95 transition"
          >
            <span className={cn(
                "flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200",
                homeActive
                  ? "bg-[#0A4A4A] text-[#F59E0B] shadow-[0_4px_12px_rgba(10,74,74,0.45)]"
                  : "bg-transparent text-[#0A4A4A]/55",
              )}>
              <Home className="size-5" strokeWidth={homeActive ? 2.25 : 2} />
            </span>
            <span className={cn("mt-0.5 max-w-full truncate text-center font-poppins text-[9px] leading-tight text-[#0A4A4A] sm:text-[10px]",
                homeActive ? "font-semibold" : "font-medium opacity-65")}>
              Home
            </span>
          </Link>

          <Link
            href={servicesHref}
            className="relative flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center px-0.5 active:scale-95 transition"
          >
            <span className={cn(
                "flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200",
                isActivePath(pathname, servicesHref, homeHref)
                  ? "bg-[#0A4A4A] text-[#F59E0B] shadow-[0_4px_12px_rgba(10,74,74,0.45)]"
                  : "bg-transparent text-[#0A4A4A]/55",
              )}>
              <Sparkles className="size-5" strokeWidth={2} />
            </span>
            <span className={cn("mt-0.5 max-w-full truncate text-center font-poppins text-[9px] leading-tight text-[#0A4A4A] sm:text-[10px]",
                isActivePath(pathname, servicesHref, homeHref) ? "font-semibold" : "font-medium opacity-65")}>
              Services
            </span>
          </Link>

          <Link
            href={testimonialsHref}
            className="relative flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center px-0.5 active:scale-95 transition"
          >
            <span className={cn(
                "flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200",
                isActivePath(pathname, testimonialsHref, homeHref)
                  ? "bg-[#0A4A4A] text-[#F59E0B] shadow-[0_4px_12px_rgba(10,74,74,0.45)]"
                  : "bg-transparent text-[#0A4A4A]/55",
              )}>
              <Quote className="size-5" strokeWidth={2} />
            </span>
            <span className={cn("mt-0.5 max-w-full truncate text-center font-poppins text-[9px] leading-tight text-[#0A4A4A] sm:text-[10px]",
                isActivePath(pathname, testimonialsHref, homeHref) ? "font-semibold" : "font-medium opacity-65")}>
              Testimonials
            </span>
          </Link>

          <button
            type="button"
            onClick={onToggle}
            aria-label="More navigation"
            aria-expanded={expanded}
            className="relative flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center px-0.5 active:scale-95 transition"
          >
            <span className={cn(
                "flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200",
                expanded
                  ? "bg-[#0A4A4A] text-[#F59E0B] shadow-[0_4px_12px_rgba(10,74,74,0.45)]"
                  : "bg-transparent text-[#0A4A4A]/55",
              )}>
              {expanded ? <X className="size-5" /> : <Briefcase className="size-5" strokeWidth={2} />}
            </span>
            <span className={cn("mt-0.5 max-w-full truncate text-center font-poppins text-[9px] leading-tight text-[#0A4A4A] sm:text-[10px]",
                expanded ? "font-semibold" : "font-medium opacity-65")}>
              More
            </span>
          </button>
        </div>
        </div>
      </div>
    </nav>
  );
}

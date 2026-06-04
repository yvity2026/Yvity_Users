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
import { YvityLogo } from "@/components/brand/yvity-logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";
import { useIsVisitorPreview } from "@/lib/use-visitor-preview";

const links = [
  { href: "/profile", label: "Home", icon: Home },
  { href: "/my-career", label: "My Career", icon: Briefcase },
  { href: "/services", label: "Services", icon: Sparkles },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/testimonials", label: "Testimonials", icon: Quote },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
] as const;

function navLinkClass(active: boolean, base: string) {
  return cn(base, active && "yvity-dash-nav-link--active");
}

function isActivePath(pathname: string, href: string) {
  if (href === "/profile") return pathname === "/profile";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthed } = useAuth();
  // Inside the advisor workspace's "Public Profile" iframe we want to mimic
  // the logged-out visitor experience even though the user is signed in.
  const isVisitorPreview = useIsVisitorPreview();
  const showAuthed = isAuthed && !isVisitorPreview;

  useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = expanded ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [expanded]);

  const ctaHref = showAuthed ? "/advisor" : "/login";
  const ctaLabel = showAuthed ? "Dashboard" : "Login";
  const CtaIcon = showAuthed ? LayoutDashboard : LogIn;

  return (
    <>
      <header className="sticky top-0 z-50 w-full yvity-dash-nav-flat border-b">
        <nav className="mx-auto max-w-6xl px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/profile" className="group rounded-lg outline-offset-4 transition-opacity hover:opacity-90">
            <YvityLogo
              size={36}
              wordmarkClassName="yvity-dash-nav-brand-name text-base md:text-lg font-semibold"
              taglineClassName="yvity-dash-nav-brand-tagline text-[10px] hidden sm:block"
            />
          </Link>

          <ul className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={navLinkClass(
                    isActivePath(pathname, l.href),
                    "yvity-dash-nav-link relative rounded-full px-3.5 py-1.5 text-sm font-medium font-poppins transition-colors",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            onClick={() => router.push(ctaHref)}
            className="yvity-dash-nav-cta inline-flex items-center gap-1.5 rounded-full px-3 md:px-4 py-1.5 md:py-2 text-xs font-semibold font-poppins shadow-md active:scale-95 transition hover:opacity-90"
          >
            <CtaIcon className="size-3.5" /> {ctaLabel}
          </button>
        </nav>
      </header>

      <MobileBottomBar
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        pathname={pathname}
        servicesHref="/services"
        testimonialsHref="/testimonials"
      />

      {expanded && (
        <div
          className="md:hidden fixed inset-0 z-[55] animate-in fade-in duration-200"
          onClick={() => setExpanded(false)}
        >
          <div className="absolute inset-0 yvity-nav-shell" />
          <div
            className="absolute inset-x-3 bottom-24 rounded-3xl glass-strong p-4 animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2 pb-3">
              <YvityLogo size={32} showTagline taglineClassName="text-[10px]" />
              <button
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
                const active = isActivePath(pathname, l.href);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
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
  servicesHref,
  testimonialsHref,
}: {
  expanded: boolean;
  onToggle: () => void;
  pathname: string;
  servicesHref: string;
  testimonialsHref: string;
}) {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-[60] pointer-events-none">
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background/95 via-background/70 to-transparent" />
      <div className="pointer-events-auto relative mx-auto mb-3 max-w-sm px-4 pb-[max(env(safe-area-inset-bottom),0.25rem)]">
        <div className="mob-nav-bottom-frame yvity-dash-nav-top-frame relative rounded-[28px]">
          <div className="mob-nav-bottom-inner yvity-dash-nav-bottom-inner relative flex h-16 items-center rounded-[28px]">
          <Link
            href={servicesHref}
            className={navLinkClass(
              isActivePath(pathname, servicesHref),
              "yvity-dash-nav-bottom-label flex flex-1 flex-col items-center gap-0.5 active:scale-95 transition",
            )}
          >
            <span
              className={cn(
                "yvity-dash-nav-bottom-icon flex size-9 items-center justify-center rounded-2xl",
                isActivePath(pathname, servicesHref) && "yvity-dash-nav-bottom-icon--active",
              )}
            >
              <Sparkles className="size-4" />
            </span>
            <span className="text-[10px] font-medium font-poppins">Services</span>
          </Link>
          <div className="w-20" />
          <Link
            href={testimonialsHref}
            className={navLinkClass(
              isActivePath(pathname, testimonialsHref),
              "yvity-dash-nav-bottom-label flex flex-1 flex-col items-center gap-0.5 active:scale-95 transition",
            )}
          >
            <span
              className={cn(
                "yvity-dash-nav-bottom-icon flex size-9 items-center justify-center rounded-2xl",
                isActivePath(pathname, testimonialsHref) && "yvity-dash-nav-bottom-icon--active",
              )}
            >
              <Quote className="size-4" />
            </span>
            <span className="text-[10px] font-medium font-poppins">Testimonials</span>
          </Link>
          <button
            onClick={onToggle}
            aria-label="Toggle navigation"
            aria-expanded={expanded}
            className={cn(
              "absolute left-1/2 -translate-x-1/2 -top-6 size-16 rounded-full yvity-nav-fab",
              "ring-4 ring-background",
              "flex items-center justify-center text-primary-foreground",
              "transition-transform duration-300 active:scale-95",
              expanded && "rotate-45",
            )}
          >
            <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 hover:opacity-100 transition" />
            {expanded ? <X className="size-6" /> : <Home className="size-6" />}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

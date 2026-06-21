"use client";

import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Home,
  Image as ImageIcon,
  Quote,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { useShowPublicVisitorNav } from "@/lib/use-public-visitor-nav";
import { usePublicProfileNavHome } from "@/hooks/use-public-profile-nav-home";

export type PublicNavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

function buildPublicNavLinks(slug: string): PublicNavLink[] {
  const base = slug ? `/${slug}` : "";
  return [
    { href: base || "/profile", label: "Home", icon: Home },
    { href: `${base}/my-career`, label: "My Career", icon: Briefcase },
    { href: `${base}/services`, label: "Services", icon: Sparkles },
    { href: `${base}/achievements`, label: "Achievements", icon: Trophy },
    { href: `${base}/testimonials`, label: "Testimonials", icon: Quote },
    { href: `${base}/gallery`, label: "Gallery", icon: ImageIcon },
  ];
}

function filterLinksByVisibility(
  links: PublicNavLink[],
  slug: string,
  visibility: {
    careerJourney: boolean;
    educationalJourney: boolean;
    achievements: boolean;
    gallery: boolean;
  },
): PublicNavLink[] {
  const base = slug ? `/${slug}` : "";
  return links.filter((link) => {
    if (link.href === `${base}/my-career`) {
      return visibility.careerJourney || visibility.educationalJourney;
    }
    if (link.href === `${base}/achievements`) return visibility.achievements;
    if (link.href === `${base}/gallery`) return visibility.gallery;
    return true;
  });
}

/** Public profile nav links — hides sections the advisor turned off in settings. */
export function useVisiblePublicNavLinks(): PublicNavLink[] {
  const showVisitorNav = useShowPublicVisitorNav();
  const { settings, loading } = useAdvisorSettings();
  const homeHref = usePublicProfileNavHome();

  return useMemo(() => {
    // Extract slug from homeHref: "/krishna-mohan-noti" → "krishna-mohan-noti"
    const slug = homeHref === "/profile" ? "" : homeHref.replace(/^\//, "");
    const allLinks = buildPublicNavLinks(slug);
    if (!showVisitorNav || loading) return allLinks;
    return filterLinksByVisibility(allLinks, slug, settings.visibility);
  }, [showVisitorNav, loading, settings.visibility, homeHref]);
}

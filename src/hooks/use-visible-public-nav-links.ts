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

export type PublicNavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const ALL_PUBLIC_NAV_LINKS: PublicNavLink[] = [
  { href: "/profile", label: "Home", icon: Home },
  { href: "/my-career", label: "My Career", icon: Briefcase },
  { href: "/services", label: "Services", icon: Sparkles },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/testimonials", label: "Testimonials", icon: Quote },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
];

function filterLinksByVisibility(
  links: PublicNavLink[],
  visibility: {
    careerJourney: boolean;
    educationalJourney: boolean;
    achievements: boolean;
    gallery: boolean;
  },
): PublicNavLink[] {
  return links.filter((link) => {
    if (link.href === "/my-career") {
      return visibility.careerJourney || visibility.educationalJourney;
    }
    if (link.href === "/achievements") return visibility.achievements;
    if (link.href === "/gallery") return visibility.gallery;
    return true;
  });
}

/** Public profile nav links — hides sections the advisor turned off in settings. */
export function useVisiblePublicNavLinks(): PublicNavLink[] {
  const showVisitorNav = useShowPublicVisitorNav();
  const { settings, loading } = useAdvisorSettings();

  return useMemo(() => {
    if (!showVisitorNav || loading) return ALL_PUBLIC_NAV_LINKS;
    return filterLinksByVisibility(ALL_PUBLIC_NAV_LINKS, settings.visibility);
  }, [showVisitorNav, loading, settings.visibility]);
}

"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth-store";
import { isAuthOverlayPath, isLandingPath } from "@/lib/landing/paths";

/** Visitor-facing pages get the public navbar; dashboard routes omit chrome. */
export function SiteChrome() {
  const pathname = usePathname();

  const onAdvisorRoute = pathname === "/advisor" || pathname.startsWith("/advisor/");
  const onDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (isLandingPath(pathname) || isAuthOverlayPath(pathname)) {
    return null;
  }

  if (onAdvisorRoute || onDashboardRoute) {
    return null;
  }

  return <Navbar />;
}

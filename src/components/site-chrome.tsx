"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";
import { YvityLogo } from "@/components/brand/yvity-logo";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth-store";
import { isAuthOverlayPath, isLandingPath } from "@/lib/landing/paths";
import { useIsVisitorPreview } from "@/lib/use-visitor-preview";

/** Hides public profile nav when advisor is signed in; omits chrome on dashboard routes. */
export function SiteChrome() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthed, ready, logout } = useAuth();
  // When the page is embedded inside the advisor workspace's "Public Profile"
  // iframe (URL contains `?preview=public`), render the same chrome a logged-
  // out visitor would see — even though the underlying session cookie is
  // still present.
  const isVisitorPreview = useIsVisitorPreview();

  const onAdvisorRoute = pathname === "/advisor" || pathname.startsWith("/advisor/");
  const onDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const effectiveAuthed = isAuthed && !isVisitorPreview;

  if (isLandingPath(pathname) || isAuthOverlayPath(pathname)) {
    return null;
  }

  if (!ready) {
    return <Navbar />;
  }

  if (effectiveAuthed && (onAdvisorRoute || onDashboardRoute)) {
    return null;
  }

  if (effectiveAuthed) {
    return (
      <header className="sticky top-0 z-50 w-full yvity-dash-nav-flat border-b">
        <nav className="mx-auto max-w-6xl px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="group rounded-lg outline-offset-4 transition-opacity hover:opacity-90">
            <YvityLogo
              size={36}
              wordmarkClassName="yvity-dash-nav-brand-name text-base md:text-lg font-semibold"
              taglineClassName="yvity-dash-nav-brand-tagline text-[10px] hidden sm:block"
            />
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="yvity-dash-nav-link inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold font-poppins transition"
            >
              <LayoutDashboard className="size-3.5" />
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => {
                void logout().then(() => router.push("/"));
              }}
              className="yvity-dash-nav-cta inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold font-poppins transition hover:opacity-90"
            >
              <LogOut className="size-3.5" />
              Logout
            </button>
          </div>
        </nav>
      </header>
    );
  }

  return <Navbar />;
}

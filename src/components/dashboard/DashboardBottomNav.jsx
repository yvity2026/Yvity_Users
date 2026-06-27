"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Home, UserRound, Users } from "lucide-react";
import {
  DASHBOARD_PRIMARY_NAV,
  isDashboardNavActive,
  resolveDashboardNavHref,
} from "@/lib/dashboard/phase1Nav";
import { useAuth } from "@/context/AuthUserContext";
import { cn } from "@/lib/utils";

const NAV_ICONS = {
  home: Home,
  "my-network": Users,
  "insurance-directory": Building2,
  "my-space": UserRound,
};

const NAV_SHORT_LABELS = {
  "insurance-directory": "Directory",
  "my-network": "Network",
  "my-space": "My Space",
};

export default function DashboardBottomNav() {
  const pathname = usePathname();
  const { user, advisor, loading } = useAuth();

  return (
    <nav
      aria-label="Mobile dashboard navigation"
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mob-nav-bottom-frame yvity-dash-nav-top-frame">
        <div className="mob-nav-bottom-inner yvity-dash-nav-bottom-inner">
          <div className="mx-auto flex h-[3.75rem] max-w-lg items-stretch justify-around px-1 sm:h-16">
            {DASHBOARD_PRIMARY_NAV.map((item) => {
              const Icon = NAV_ICONS[item.id];
              const href = loading
                ? item.href
                : resolveDashboardNavHref(item, user, advisor);
              const isActive = isDashboardNavActive(
                pathname,
                item,
                href,
                user,
                advisor,
              );

              return (
                <Link
                  key={item.id}
                  href={href}
                  aria-label={item.ariaLabel}
                  aria-current={isActive ? "page" : undefined}
                  className="relative flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center px-0.5"
                >
                  <span
                    className={cn(
                      "yvity-dash-nav-bottom-icon flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200",
                      isActive && "yvity-dash-nav-bottom-icon--active",
                    )}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.25 : 2} />
                  </span>
                  <span
                    className={cn(
                      "yvity-dash-nav-bottom-label mt-0.5 max-w-full truncate text-center font-poppins text-[9px] leading-tight sm:text-[10px]",
                      isActive ? "font-semibold" : "font-medium opacity-65",
                    )}
                  >
                    {NAV_SHORT_LABELS[item.id] ?? item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

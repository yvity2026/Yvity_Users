"use client";

import { usePathname } from "next/navigation";
import DashboardBottomNav from "./DashboardBottomNav";
import DashboardTopBar from "./DashboardTopBar";
import { DASHBOARD_MY_SPACE_PATH, DASHBOARD_TOP_ROUTES } from "@/lib/dashboard/phase1Nav";

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const isMySpace =
    pathname === DASHBOARD_MY_SPACE_PATH || pathname?.startsWith(`${DASHBOARD_MY_SPACE_PATH}/`);
  const useFlatNavPadding =
    isMySpace || pathname === DASHBOARD_TOP_ROUTES.profile;

  return (
    <div className="min-h-screen bg-background">
      <DashboardTopBar />
      <div
        className={
          useFlatNavPadding
            ? "pt-[calc(3.75rem+env(safe-area-inset-top,0px))] sm:pt-[calc(4rem+env(safe-area-inset-top,0px))] lg:pt-[calc(4rem+env(safe-area-inset-top,0px))] pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0"
            : "pt-[calc(3.75rem+env(safe-area-inset-top,0px))] sm:pt-[calc(4rem+env(safe-area-inset-top,0px))] lg:pt-[calc(5.75rem+env(safe-area-inset-top,0px))] pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0"
        }
      >
        {children}
      </div>
      <DashboardBottomNav />
    </div>
  );
}

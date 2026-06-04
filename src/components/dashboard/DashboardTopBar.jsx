"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoNotificationsOutline } from "react-icons/io5";
import BrandMark from "@/components/brand/BrandMark";
import UserProfileAvatar from "@/components/user/UserProfileAvatar";
import { useAuth } from "@/context/AuthUserContext";
import {
  DASHBOARD_MY_SPACE_PATH,
  DASHBOARD_PRIMARY_NAV,
  DASHBOARD_TOP_ROUTES,
  isDashboardNavActive,
  resolveDashboardNavHref,
} from "@/lib/dashboard/phase1Nav";
import { getAdvisorWorkspaceSetupState } from "@/lib/advisor/workspaceSetupStatus";
import { cn } from "@/lib/utils";

function DashboardNavLinks({ pathname, user, advisor, loading }) {
  return DASHBOARD_PRIMARY_NAV.map((item) => {
    const href = loading ? item.href : resolveDashboardNavHref(item, user, advisor);
    const active = isDashboardNavActive(pathname, item, href, user, advisor);

    return (
      <Link
        key={item.id}
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "yvity-dash-nav-link rounded-full px-3 py-2 font-poppins text-xs font-medium sm:px-4 sm:text-sm xl:px-5",
          active && "yvity-dash-nav-link--active",
        )}
      >
        {item.label}
        {item.phase === 2 ? (
          <span className="yvity-dash-nav-soon ml-1 hidden text-[9px] font-semibold uppercase tracking-wide sm:inline xl:text-[10px]">
            Soon
          </span>
        ) : null}
      </Link>
    );
  });
}

function TopBarActions({ user, setupState }) {
  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      {setupState?.shouldPromptIrdaiUpload || setupState?.isIrdaiRejected ? (
        <Link
          href={`${DASHBOARD_MY_SPACE_PATH}?setup=irdai`}
          className="yvity-dash-nav-cta hidden min-h-[36px] items-center rounded-full px-3 py-2 font-poppins text-xs font-semibold transition hover:opacity-90 sm:inline-flex sm:px-4 sm:text-sm"
        >
          Upload IRDAI
        </Link>
      ) : null}
      <Link
        href={DASHBOARD_TOP_ROUTES.notifications}
        className="yvity-dash-nav-action relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors sm:h-10 sm:w-10"
        aria-label="Notifications"
      >
        <IoNotificationsOutline size={20} className="sm:hidden" />
        <IoNotificationsOutline size={22} className="hidden sm:block" />
        <span className="yvity-dash-nav-soon absolute top-1.5 right-1.5 h-2 w-2 rounded-full border border-background bg-current sm:top-2 sm:right-2.5" />
      </Link>

      <Link href={DASHBOARD_TOP_ROUTES.profile} aria-label="Profile and account">
        <UserProfileAvatar
          src={user?.selfie_url}
          name={user?.name}
          size={38}
          className="yvity-dash-nav-avatar-ring ring-2"
        />
      </Link>
    </div>
  );
}

function BrandBlock({ layout = "column" }) {
  return (
    <BrandMark
      logoSize={layout === "row" ? 40 : 40}
      showName
      showTagline
      layout={layout}
      logoClassName={layout === "row" ? "h-9 w-9 object-contain" : "h-10 w-10 object-contain"}
      nameClassName={cn(
        "yvity-dash-nav-brand-name font-cormorant font-bold leading-none",
        layout === "row" ? "text-base" : "text-base",
      )}
      taglineClassName="yvity-dash-nav-brand-tagline font-poppins text-[10px] font-semibold leading-tight"
    />
  );
}

export default function DashboardTopBar() {
  const pathname = usePathname();
  const { user, advisor, loading } = useAuth();
  const setupState = loading ? null : getAdvisorWorkspaceSetupState(user, advisor);
  const isMySpace =
    pathname === DASHBOARD_MY_SPACE_PATH || pathname?.startsWith(`${DASHBOARD_MY_SPACE_PATH}/`);

  return (
    <header className="fixed inset-x-0 top-0 z-50 m-0 p-0">
      {/* Mobile */}
      <div className="mob-nav-top-frame yvity-dash-nav-top-frame lg:hidden">
        <div className="glass-nav-mobile mob-nav-top-inner yvity-dash-nav-top-inner">
          <div className="mx-auto flex h-[3.75rem] w-full max-w-[1536px] items-center justify-between px-4 sm:h-16">
            <Link
              href={DASHBOARD_TOP_ROUTES.home}
              className="flex min-w-0 items-center justify-start"
              aria-label="YVITY home"
            >
              <BrandBlock />
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href={DASHBOARD_TOP_ROUTES.notifications}
                className="yvity-dash-nav-action relative flex h-9 w-9 items-center justify-center rounded-full border"
                aria-label="Notifications"
              >
                <IoNotificationsOutline size={20} />
                <span className="yvity-dash-nav-soon absolute top-1.5 right-1.5 h-2 w-2 rounded-full border border-background bg-current" />
              </Link>

              <Link href={DASHBOARD_TOP_ROUTES.profile} aria-label="Profile and account">
                <UserProfileAvatar
                  src={user?.selfie_url}
                  name={user?.name}
                  size={36}
                  className="yvity-dash-nav-avatar-ring ring-2"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop — flat bar on My Space */}
      {isMySpace ? (
        <div className="yvity-dash-nav-flat hidden border-b lg:block">
          <div className="mx-auto flex h-16 w-full max-w-[1536px] items-center justify-between gap-4 px-6">
            <Link
              href={DASHBOARD_TOP_ROUTES.home}
              className="flex shrink-0 items-center"
              aria-label="YVITY home"
            >
              <BrandBlock layout="row" />
            </Link>

            <nav
              aria-label="Dashboard"
              className="flex min-w-0 flex-1 items-center justify-center gap-0.5 sm:gap-1"
            >
              <DashboardNavLinks
                pathname={pathname}
                user={user}
                advisor={advisor}
                loading={loading}
              />
            </nav>

            <TopBarActions user={user} setupState={setupState} />
          </div>
        </div>
      ) : (
        <div className="app-top-nav-desktop-wrap mx-auto hidden w-full max-w-[1536px] justify-center px-0 lg:flex lg:px-6">
          <div className="relative h-17.5 w-full max-w-4xl xl:max-w-7xl">
            <div className="glass-nav-frame yvity-dash-nav-pill-frame relative flex h-full w-full items-center rounded-[100px] p-[1px]">
              <div className="glass-nav-desktop yvity-dash-nav-pill-surface relative z-10 flex h-full w-full items-center justify-between gap-4 rounded-[100px] px-4 py-3 sm:px-6 xl:px-8">
                <Link
                  href={DASHBOARD_TOP_ROUTES.home}
                  className="flex shrink-0 items-center justify-start"
                  aria-label="YVITY home"
                >
                  <BrandMark
                    logoSize={48}
                    showName
                    showTagline
                    layout="row"
                    logoClassName="h-10 w-10 object-contain sm:h-12 sm:w-12"
                    nameClassName="yvity-dash-nav-brand-name font-cormorant text-lg font-bold leading-none xl:text-xl"
                    taglineClassName="yvity-dash-nav-brand-tagline font-poppins text-[10px] font-semibold leading-tight sm:text-[11px]"
                  />
                </Link>

                <nav
                  aria-label="Dashboard"
                  className="flex min-w-0 flex-1 items-center justify-center gap-0.5 sm:gap-1"
                >
                  <DashboardNavLinks
                    pathname={pathname}
                    user={user}
                    advisor={advisor}
                    loading={loading}
                  />
                </nav>

                <TopBarActions user={user} setupState={setupState} />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

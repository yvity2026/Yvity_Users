import {
  getMySpaceHref,
  isAdvisorDashboardRoute,
} from "@/lib/dashboard/advisorWorkspace";

export const DASHBOARD_HOME_PATH = "/dashboard";
export const DASHBOARD_NETWORK_PATH = "/dashboard/my-network";
export const DASHBOARD_MY_SPACE_PATH = "/dashboard/my-space";
export const DASHBOARD_INSURANCE_DIRECTORY_PATH = "/dashboard/insurance-directory";

export const DASHBOARD_PRIMARY_NAV = [
  {
    id: "home",
    label: "Home",
    href: DASHBOARD_HOME_PATH,
    ariaLabel: "Home — search professionals",
  },
  {
    id: "my-network",
    label: "My Network",
    href: DASHBOARD_NETWORK_PATH,
    ariaLabel: "My network — coming soon",
    phase: 2,
  },
  {
    id: "insurance-directory",
    label: "Insurance Directory",
    href: DASHBOARD_INSURANCE_DIRECTORY_PATH,
    ariaLabel: "Insurance Directory — company contacts and info",
  },
  {
    id: "my-space",
    label: "My Space",
    href: DASHBOARD_MY_SPACE_PATH,
    ariaLabel: "My space — your workspace",
  },
];

export const DASHBOARD_TOP_ROUTES = {
  home: DASHBOARD_HOME_PATH,
  profile: "/dashboard/profile",
  notifications: "/dashboard/activity",
  activity: "/dashboard/activity",
  myNetwork: DASHBOARD_NETWORK_PATH,
  insuranceDirectory: DASHBOARD_INSURANCE_DIRECTORY_PATH,
  mySpace: DASHBOARD_MY_SPACE_PATH,
};

export function resolveDashboardNavHref(item, user, advisor) {
  if (item.id === "my-space") {
    return getMySpaceHref(user, advisor);
  }
  return item.href;
}

export function isDashboardNavActive(pathname, item, resolvedHref, user, advisor) {
  const href = resolvedHref ?? item.href;

  if (item.id === "home") {
    return pathname === DASHBOARD_HOME_PATH;
  }

  if (item.id === "my-space") {
    return (
      pathname === DASHBOARD_MY_SPACE_PATH ||
      pathname.startsWith(`${DASHBOARD_MY_SPACE_PATH}/`) ||
      (user && advisor && isAdvisorDashboardRoute(pathname, user, advisor))
    );
  }

  if (item.id === "my-network") {
    return (
      pathname === DASHBOARD_NETWORK_PATH ||
      pathname.startsWith(`${DASHBOARD_NETWORK_PATH}/`)
    );
  }

  if (item.id === "insurance-directory") {
    return (
      pathname === DASHBOARD_INSURANCE_DIRECTORY_PATH ||
      pathname.startsWith(`${DASHBOARD_INSURANCE_DIRECTORY_PATH}/`)
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

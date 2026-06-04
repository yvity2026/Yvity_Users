export const ADVISOR_DASHBOARD_PATH = "/advisor/dashboard";
export const ADVISOR_MY_SPACE_DASHBOARD_PATH = "/dashboard/my-space";

/**
 * Whether the user can open the full advisor dashboard (/advisor/dashboard).
 * Matches advisor layout gate — role + active account (not profile_status boolean).
 */
export function canAccessAdvisorDashboard(user, advisor) {
  if (!user?.id) return false;

  let roles = user.roles;
  if (typeof roles === "string") {
    try {
      roles = JSON.parse(roles);
    } catch {
      roles = [];
    }
  }

  if (!Array.isArray(roles) || !roles.includes("advisor")) {
    return false;
  }

  return advisor?.account_status === "active";
}

/** Primary advisor dashboard route (active → /advisor/dashboard, in review → My Space). */
export function getAdvisorDashboardHref(user, advisor) {
  if (canAccessAdvisorDashboard(user, advisor)) {
    return ADVISOR_DASHBOARD_PATH;
  }

  if (advisor?.account_status === "under_review") {
    return ADVISOR_MY_SPACE_DASHBOARD_PATH;
  }

  return ADVISOR_MY_SPACE_DASHBOARD_PATH;
}

/** Sidebar / nav active state for the Dashboard item. */
export function isAdvisorDashboardRoute(pathname, user, advisor) {
  const dashboardHref = getAdvisorDashboardHref(user, advisor);

  if (pathname === dashboardHref || pathname.startsWith(`${dashboardHref}/`)) {
    return true;
  }

  if (
    advisor?.account_status === "under_review" &&
    (pathname === ADVISOR_DASHBOARD_PATH ||
      pathname.startsWith(`${ADVISOR_DASHBOARD_PATH}/`))
  ) {
    return true;
  }

  return false;
}

export function shouldUseAdvisorReviewMode(advisor) {
  return advisor?.account_status === "under_review";
}

/** Resolve advisor sidebar link (Dashboard item respects review vs active). */
export function resolveAdvisorNavHref(item, user, advisor) {
  const link = item?.link || "#";

  if (link === ADVISOR_DASHBOARD_PATH) {
    return getAdvisorDashboardHref(user, advisor);
  }

  return link;
}

export function isAdvisorNavItemActive(item, pathname, user, advisor) {
  const link = item?.link || "";

  if (link === ADVISOR_DASHBOARD_PATH) {
    return isAdvisorDashboardRoute(pathname, user, advisor);
  }

  return pathname === link || pathname.startsWith(`${link}/`);
}

/** Bottom nav + My Space hub link target */
export function getMySpaceHref() {
  return ADVISOR_MY_SPACE_DASHBOARD_PATH;
}

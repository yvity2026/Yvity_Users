export const IDENTITY_REFRESH_INTERVAL_DAYS = 365;
export const IDENTITY_REMINDER_DAYS = 30;
export const IDENTITY_GRACE_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getIdentityAnchorAt(user: Record<string, unknown> | null | undefined) {
  if (!user || typeof user !== "object") return null;
  return (user.identity_verified_at as string) || (user.created_at as string) || null;
}

function toDate(value: unknown) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function diffDays(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export function getIdentityRefreshStatus(
  user: Record<string, unknown> | null | undefined,
  nowInput: Date = new Date(),
) {
  const now = toDate(nowInput);
  const anchor = toDate(getIdentityAnchorAt(user));

  if (!now || !anchor) {
    return {
      status: "unknown" as const,
      canPerformTrustActions: true,
      canShowAdvisorPublicly: true,
      dueAt: null,
      graceEndsAt: null,
      daysUntilDue: null,
      daysOverdue: null,
      daysInGrace: null,
      anchorAt: null,
    };
  }

  const dueAt = addDays(anchor, IDENTITY_REFRESH_INTERVAL_DAYS);
  const reminderAt = addDays(dueAt, -IDENTITY_REMINDER_DAYS);
  const graceEndsAt = addDays(dueAt, IDENTITY_GRACE_DAYS);
  const daysUntilDue = diffDays(now, dueAt);

  if (now < reminderAt) {
    return {
      status: "ok" as const,
      canPerformTrustActions: true,
      canShowAdvisorPublicly: true,
      dueAt: dueAt.toISOString(),
      graceEndsAt: graceEndsAt.toISOString(),
      daysUntilDue,
      daysOverdue: null,
      daysInGrace: null,
      anchorAt: anchor.toISOString(),
    };
  }

  if (now < dueAt) {
    return {
      status: "due_soon" as const,
      canPerformTrustActions: true,
      canShowAdvisorPublicly: true,
      dueAt: dueAt.toISOString(),
      graceEndsAt: graceEndsAt.toISOString(),
      daysUntilDue,
      daysOverdue: null,
      daysInGrace: null,
      anchorAt: anchor.toISOString(),
    };
  }

  if (now < graceEndsAt) {
    return {
      status: "grace" as const,
      canPerformTrustActions: false,
      canShowAdvisorPublicly: false,
      dueAt: dueAt.toISOString(),
      graceEndsAt: graceEndsAt.toISOString(),
      daysUntilDue,
      daysOverdue: diffDays(dueAt, now),
      daysInGrace: diffDays(now, graceEndsAt),
      anchorAt: anchor.toISOString(),
    };
  }

  return {
    status: "overdue" as const,
    canPerformTrustActions: false,
    canShowAdvisorPublicly: false,
    dueAt: dueAt.toISOString(),
    graceEndsAt: graceEndsAt.toISOString(),
    daysUntilDue,
    daysOverdue: diffDays(dueAt, now),
    daysInGrace: null,
    anchorAt: anchor.toISOString(),
  };
}

export function canPerformTrustActions(
  user: Record<string, unknown> | null | undefined,
  nowInput?: Date,
) {
  return getIdentityRefreshStatus(user, nowInput).canPerformTrustActions;
}

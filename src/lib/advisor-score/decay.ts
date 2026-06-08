/** Score decay starts after this many days from account creation. */
export const SCORE_DECAY_GRACE_DAYS = 30;

export const DECAY_CAPS = {
  profileViews: 10,
  selfShare: 5,
  clientShare: 5,
  login: 5,
} as const;

export type MonthlyScoreActivity = {
  /** Unique profile views in the calendar month. */
  uniqueProfileViews: number;
  /** Advisor self-share events in the month. */
  selfShares: number;
  /** Unique logged-in clients who shared in the month. */
  clientSharers: number;
  /** Distinct days the advisor logged in during the month. */
  loginDays: number;
};

export type ScoreDecayLedger = {
  advisorUserId: string;
  profileViewsDecay: number;
  selfShareDecay: number;
  clientShareDecay: number;
  loginDecay: number;
  /** Last fully evaluated calendar month (`YYYY-MM`). */
  lastEvaluatedMonth: string | null;
};

export type ScoreDecayBreakdown = {
  profileViews: number;
  selfShare: number;
  clientShare: number;
  login: number;
  total: number;
};

export type ScoreDecayState = {
  active: boolean;
  graceDaysRemaining: number | null;
  penalty: number;
  breakdown: ScoreDecayBreakdown;
  ledger: ScoreDecayLedger;
  /** Activity for the current in-progress month (informational). */
  currentMonthActivity: MonthlyScoreActivity;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function monthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function parseMonthKey(key: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(key);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  if (!Number.isFinite(year) || month < 0 || month > 11) return null;
  return { year, month };
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function diffDays(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export function daysSinceAccountCreated(
  accountCreatedAt: string | null | undefined,
  now: Date = new Date(),
): number | null {
  const created = toDate(accountCreatedAt);
  if (!created) return null;
  return Math.max(0, diffDays(created, now));
}

export function scoreDecayGraceDaysRemaining(
  accountCreatedAt: string | null | undefined,
  now: Date = new Date(),
): number | null {
  const days = daysSinceAccountCreated(accountCreatedAt, now);
  if (days == null) return null;
  return Math.max(0, SCORE_DECAY_GRACE_DAYS - days);
}

/** True when the account is older than the 30-day grace window. */
export function isScoreDecayEligible(
  accountCreatedAt: string | null | undefined,
  now: Date = new Date(),
): boolean {
  const days = daysSinceAccountCreated(accountCreatedAt, now);
  if (days == null) return false;
  return days >= SCORE_DECAY_GRACE_DAYS;
}

/** First calendar month (`YYYY-MM`) in which decay can accrue. */
export function firstDecayMonthKey(
  accountCreatedAt: string | null | undefined,
): string | null {
  const created = toDate(accountCreatedAt);
  if (!created) return null;
  const graceEnds = new Date(created.getTime() + SCORE_DECAY_GRACE_DAYS * MS_PER_DAY);
  return monthKey(graceEnds);
}

/** Increment applied to a decay ledger for one inactive month. */
export function monthDecayIncrement(activity: MonthlyScoreActivity): ScoreDecayBreakdown {
  const profileViews = activity.uniqueProfileViews === 0 ? 1 : 0;
  const selfShare = activity.selfShares < 5 ? 1 : 0;
  const clientShare = activity.clientSharers === 0 ? 1 : 0;
  const login = activity.loginDays === 0 ? 1 : 0;
  return {
    profileViews,
    selfShare,
    clientShare,
    login,
    total: profileViews + selfShare + clientShare + login,
  };
}

export function emptyDecayLedger(advisorUserId: string): ScoreDecayLedger {
  return {
    advisorUserId,
    profileViewsDecay: 0,
    selfShareDecay: 0,
    clientShareDecay: 0,
    loginDecay: 0,
    lastEvaluatedMonth: null,
  };
}

export function ledgerPenaltyTotal(ledger: ScoreDecayLedger): number {
  return (
    ledger.profileViewsDecay +
    ledger.selfShareDecay +
    ledger.clientShareDecay +
    ledger.loginDecay
  );
}

export function ledgerBreakdown(ledger: ScoreDecayLedger): ScoreDecayBreakdown {
  return {
    profileViews: ledger.profileViewsDecay,
    selfShare: ledger.selfShareDecay,
    clientShare: ledger.clientShareDecay,
    login: ledger.loginDecay,
    total: ledgerPenaltyTotal(ledger),
  };
}

function applyIncrement(ledger: ScoreDecayLedger, increment: ScoreDecayBreakdown): ScoreDecayLedger {
  return {
    ...ledger,
    profileViewsDecay: Math.min(
      DECAY_CAPS.profileViews,
      ledger.profileViewsDecay + increment.profileViews,
    ),
    selfShareDecay: Math.min(DECAY_CAPS.selfShare, ledger.selfShareDecay + increment.selfShare),
    clientShareDecay: Math.min(
      DECAY_CAPS.clientShare,
      ledger.clientShareDecay + increment.clientShare,
    ),
    loginDecay: Math.min(DECAY_CAPS.login, ledger.loginDecay + increment.login),
  };
}

/** Months strictly before the current calendar month that still need evaluation. */
export function pendingEvaluationMonths(
  lastEvaluatedMonth: string | null,
  now: Date = new Date(),
  earliestMonth?: string | null,
): string[] {
  const current = monthKey(now);
  let cursor: Date | null = null;

  if (lastEvaluatedMonth) {
    const parsed = parseMonthKey(lastEvaluatedMonth);
    if (!parsed) return [];
    cursor = addMonths(new Date(parsed.year, parsed.month, 1), 1);
  } else if (earliestMonth) {
    const parsed = parseMonthKey(earliestMonth);
    if (!parsed) return [];
    cursor = new Date(parsed.year, parsed.month, 1);
  }

  if (!cursor) return [];

  const months: string[] = [];
  while (monthKey(cursor) < current) {
    months.push(monthKey(cursor));
    cursor = addMonths(cursor, 1);
  }

  return months;
}

export function evaluateDecayLedger(input: {
  advisorUserId: string;
  accountCreatedAt: string | null | undefined;
  profileApproved: boolean;
  ledger: ScoreDecayLedger;
  loadMonthActivity: (monthKey: string) => MonthlyScoreActivity | Promise<MonthlyScoreActivity>;
  currentMonthActivity: MonthlyScoreActivity;
  now?: Date;
}): Promise<ScoreDecayState> {
  return Promise.resolve().then(async () => {
    const now = input.now ?? new Date();
    const graceDaysRemaining = scoreDecayGraceDaysRemaining(input.accountCreatedAt, now);
    const eligible = isScoreDecayEligible(input.accountCreatedAt, now);
    const firstMonth = firstDecayMonthKey(input.accountCreatedAt);

    if (!eligible || !input.profileApproved || !firstMonth) {
      return {
        active: false,
        graceDaysRemaining,
        penalty: 0,
        breakdown: { profileViews: 0, selfShare: 0, clientShare: 0, login: 0, total: 0 },
        ledger: input.ledger,
        currentMonthActivity: input.currentMonthActivity,
      };
    }

    let ledger = { ...input.ledger, advisorUserId: input.advisorUserId };
    const monthsToEvaluate = pendingEvaluationMonths(
      ledger.lastEvaluatedMonth,
      now,
      firstMonth,
    );

    for (const key of monthsToEvaluate) {
      const activity = await input.loadMonthActivity(key);
      ledger = applyIncrement(ledger, monthDecayIncrement(activity));
      ledger.lastEvaluatedMonth = key;
    }

    const breakdown = ledgerBreakdown(ledger);

    return {
      active: true,
      graceDaysRemaining: 0,
      penalty: breakdown.total,
      breakdown,
      ledger,
      currentMonthActivity: input.currentMonthActivity,
    };
  });
}

export function buildDecayNegativeRules(state: Pick<ScoreDecayState, "active" | "graceDaysRemaining">) {
  const graceNote =
    !state.active && state.graceDaysRemaining != null
      ? `Starts ${state.graceDaysRemaining} day${state.graceDaysRemaining === 1 ? "" : "s"} after account creation (${SCORE_DECAY_GRACE_DAYS}-day grace).`
      : state.active
        ? "Active — inactive months reduce your score (see caps below)."
        : `Starts ${SCORE_DECAY_GRACE_DAYS} days after account creation.`;

  return [
    {
      label: "Profile Views",
      description: "Every 5 unique views = 1 pt (Max: 10 pts).",
      decay: `0 views in a month → -1 pt (Max: -${DECAY_CAPS.profileViews} pts). ${graceNote}`,
    },
    {
      label: "Self-Share",
      description: "Every 5 shares = 1 pt (Max: 5 pts).",
      decay: `< 5 shares/month → -1 pt (Max: -${DECAY_CAPS.selfShare} pts). ${graceNote}`,
    },
    {
      label: "Others-Share",
      description: "1 logged-in customer share = 1 pt (Max: 5 pts).",
      decay: `0 customer shares/month → -1 pt (Max: -${DECAY_CAPS.clientShare} pts). ${graceNote}`,
    },
    {
      label: "Login Activity",
      description: "5 logins in a month = 5 pts (Max: 5 pts).",
      decay: `0 logins in a month → -1 pt (Max: -${DECAY_CAPS.login} pts). ${graceNote}`,
    },
  ];
}

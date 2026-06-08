import {
  buildDecayNegativeRules,
  evaluateDecayLedger,
  ledgerPenaltyTotal,
  type ScoreDecayState,
} from "@/lib/advisor-score/decay";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { getAdvisorProfileForUser } from "@/lib/server/advisor-profile-store";
import { loadRegistrationDb } from "@/lib/server/registration-store";
import {
  loadCurrentMonthlyScoreActivity,
  loadMonthlyScoreActivity,
  loadScoreDecayLedger,
  saveScoreDecayLedger,
} from "@/lib/server/score-activity-persistence";

export async function evaluateAdvisorScoreDecay(
  advisorUserId: string,
  options: {
    accountCreatedAt?: string | null;
    profileApproved?: boolean;
  } = {},
): Promise<ScoreDecayState> {
  const profile = await getAdvisorProfileForUser(advisorUserId);
  const registered = loadRegistrationDb().users.find((user) => user.id === advisorUserId) ?? null;

  const accountCreatedAt =
    options.accountCreatedAt ??
    (registered?.createdAt ? new Date(registered.createdAt).toISOString() : null);
  const profileApproved =
    options.profileApproved ?? isAdvisorProfileApproved(profile);

  const [ledger, currentMonthActivity] = await Promise.all([
    loadScoreDecayLedger(advisorUserId),
    loadCurrentMonthlyScoreActivity(advisorUserId),
  ]);

  const state = await evaluateDecayLedger({
    advisorUserId,
    accountCreatedAt,
    profileApproved,
    ledger,
    currentMonthActivity,
    loadMonthActivity: (month) => loadMonthlyScoreActivity(advisorUserId, month),
  });

  if (
    state.ledger.lastEvaluatedMonth !== ledger.lastEvaluatedMonth ||
    ledgerPenaltyTotal(state.ledger) !== ledgerPenaltyTotal(ledger)
  ) {
    await saveScoreDecayLedger(state.ledger);
  }

  return state;
}

import { getSessionUser } from "@/lib/server/session";

export async function evaluateAdvisorScoreDecayForSession(): Promise<ScoreDecayState | null> {
  const session = await getSessionUser();
  if (!session?.id) return null;
  return evaluateAdvisorScoreDecay(session.id);
}

export { buildDecayNegativeRules };

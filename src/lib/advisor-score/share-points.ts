/** Self-share scoring — Profile Sharing (self) in YVITY Score Visibility. */
export const SELF_SHARES_PER_POINT = 5;
export const MAX_SELF_SHARE_POINTS = 5;
export const MAX_SELF_SHARE_EVENTS = SELF_SHARES_PER_POINT * MAX_SELF_SHARE_POINTS;

/** Client-share scoring — unique logged-in users (not the advisor). */
export const MAX_CLIENT_SHARE_POINTS = 5;

export function computeSelfSharePoints(shareCount: number): number {
  const count = Math.max(0, shareCount);
  return Math.min(MAX_SELF_SHARE_POINTS, Math.floor(count / SELF_SHARES_PER_POINT));
}

export function computeClientSharePoints(uniqueSharerCount: number): number {
  return Math.min(MAX_CLIENT_SHARE_POINTS, Math.max(0, uniqueSharerCount));
}

export function selfSharesUntilNextPoint(shareCount: number): number {
  const count = Math.max(0, shareCount);
  if (count >= MAX_SELF_SHARE_EVENTS) return 0;
  const remainder = count % SELF_SHARES_PER_POINT;
  return remainder === 0 && count > 0 ? 0 : SELF_SHARES_PER_POINT - remainder;
}

export function selfSharesUntilMaxPoints(shareCount: number): number {
  return Math.max(0, MAX_SELF_SHARE_EVENTS - Math.max(0, shareCount));
}

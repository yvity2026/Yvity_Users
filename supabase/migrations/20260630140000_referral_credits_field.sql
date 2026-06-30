-- Add credits_awarded to referrals so we can sum credits per advisor per cycle.
-- Silver referral = 600 credits, Gold referral = 1000 credits.
-- NULL means referral is still in 'registered' status (not yet qualified / paid).

alter table public.referrals
  add column if not exists credits_awarded integer;

-- Ambassador level is computed live from qualified referral count,
-- but we store the last-known badge so public profiles can show it without re-querying.
alter table public.ambassador_profiles
  add column if not exists badge_level text,
  add column if not exists total_credits_earned integer not null default 0,
  add column if not exists credits_cycle_start timestamptz,
  add column if not exists credits_expire_at timestamptz;

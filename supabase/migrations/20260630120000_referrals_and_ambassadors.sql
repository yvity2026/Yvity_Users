-- Apply from Yvity_Admin / YVITY-Dashboard: supabase db push
-- Stores ambassador referral links and referral records persistently.

create table if not exists public.ambassador_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  referral_code text not null unique,
  status text not null default 'active',
  total_referrals integer not null default 0,
  successful_referrals integer not null default 0,
  referral_link text,
  created_at timestamptz not null default now(),
  promoted_at timestamptz not null default now()
);

create index if not exists ambassador_profiles_referral_code_idx
  on public.ambassador_profiles (referral_code);

alter table public.ambassador_profiles enable row level security;

-- One row per user who registered through a referral link.
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id text not null,
  referrer_code text not null,
  referred_user_id text not null unique,
  referred_user_name text not null,
  registered_at timestamptz not null default now(),
  plan_purchased text,
  purchased_at timestamptz,
  payment_id text,
  status text not null default 'registered',
  reward_id uuid
);

create index if not exists referrals_referrer_user_id_idx
  on public.referrals (referrer_user_id);

create index if not exists referrals_referred_user_id_idx
  on public.referrals (referred_user_id);

alter table public.referrals enable row level security;

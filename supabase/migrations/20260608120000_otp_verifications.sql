-- Apply from Yvity_Admin / YVITY-Dashboard: supabase db push
-- Stores short-lived OTP codes for login, testimonials, recommendations, etc.

create table if not exists public.otp_verifications (
  purpose_key text primary key,
  identifier text not null,
  purpose text not null,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists otp_verifications_expires_at_idx
  on public.otp_verifications (expires_at);

alter table public.otp_verifications enable row level security;

-- Creates advisor_testimonials if it doesn't already exist.
-- If the table was created by the admin app it will be skipped; this just ensures
-- the columns the users app writes (media_url, reply_text, reply_created_at) exist.

create table if not exists advisor_testimonials (
  id                uuid primary key default gen_random_uuid(),
  advisor_id        uuid not null,
  name              text not null,
  mobile_number     text not null default '0000000000',
  testimonial_type  text not null default 'text', -- text | audio | video
  content           text,                          -- JSON-embedded meta via embedGoldMeta()
  media_url         text,                          -- Supabase Storage public URL for audio/video
  testimonial_rating integer,
  status            text not null default 'pending', -- pending | approved | rejected
  is_mobile_verified boolean not null default false,
  is_verified       boolean not null default false,
  reply_text        text,
  reply_created_at  timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Add columns that might be missing if the table was created by an older admin-app migration
alter table advisor_testimonials add column if not exists media_url text;
alter table advisor_testimonials add column if not exists reply_text text;
alter table advisor_testimonials add column if not exists reply_created_at timestamptz;
alter table advisor_testimonials add column if not exists testimonial_type text not null default 'text';

-- Index for the primary query pattern: all testimonials for an advisor
create index if not exists idx_advisor_testimonials_advisor_id
  on advisor_testimonials (advisor_id, created_at desc);

-- RLS: advisors can see their own; public can see approved ones
alter table advisor_testimonials enable row level security;

drop policy if exists "Advisors manage own testimonials" on advisor_testimonials;
create policy "Advisors manage own testimonials"
  on advisor_testimonials for all
  using (advisor_id = auth.uid());

drop policy if exists "Public can read approved testimonials" on advisor_testimonials;
create policy "Public can read approved testimonials"
  on advisor_testimonials for select
  using (status = 'approved');

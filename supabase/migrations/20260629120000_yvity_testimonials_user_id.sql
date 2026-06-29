-- Add user_id to yvity_testimonials for repeat-offender tracking.
-- Nullable so existing rows are unaffected.
ALTER TABLE public.yvity_testimonials
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS yvity_testimonials_user_id_idx ON public.yvity_testimonials (user_id);

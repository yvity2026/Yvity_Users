# Archived Supabase bridge (from legacy `YVITY/` monolith)

These files were copied from `YVITY/src/lib/yvity-gold/bridge/` before removing the
reference subfolder. They map YVITY-Gold JSON shapes to Supabase tables (`advisor_journey`,
`advisor_services`, `gold_settings`, etc.).

**Not wired into the root app yet** — imports target the old monolith (`ValidateAdvisor`, etc.).
Use as reference when migrating `src/lib/server/*` from `.data` to Supabase on `feat/supabase-live`.

Do not import from production code until adapted to `src/lib/supabase/adminClient.ts` and
current auth/session helpers.

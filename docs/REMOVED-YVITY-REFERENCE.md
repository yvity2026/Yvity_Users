# Legacy `YVITY/` reference folder (removed)

The `YVITY/` subfolder was a **separate Next.js app** (`my-app`) that embedded an older copy of
YVITY Gold and shared Supabase CLI scripts with `YVITY-Dashboard/`. It was **not** used by the
root **YVITY-Gold** app (`package.json` name: `yvity-gold`, port 3002).

## What lived there

- Main marketing site + auth shell (port 3000 style monolith)
- `src/yvity-gold/` — duplicate of Gold components
- `src/lib/yvity-gold/bridge/` — Supabase sync mappers (archived under `src/lib/yvity-supabase-bridge/`)

## What to keep in the repo

| Folder | Keep? |
|--------|--------|
| **Root `src/`** | Yes — active YVITY Gold |
| **`YVITY-Dashboard/`** | Yes — admin IRDAI / approvals UI |
| **`YVITY/`** | Removed — reference only |
| **`YVITY-main/`** | Never existed (broken `dev:main` script removed) |

## Supabase schema

Use `YVITY-Dashboard/supabase/schema/yvity_gold_e2e_schema.sql` (schema owner repo; not `YVITY/supabase/`).

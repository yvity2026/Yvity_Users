# Database schema moved to YVITY-Dashboard

**All Supabase schema, migrations, and SQL live in the YVITY-Dashboard repo:**

```
YVITY-Dashboard/supabase/
├── migrations/          # CLI migrations (source of truth for apply)
├── migrations_legacy/
├── schema/              # yvity_gold_e2e_schema.sql (full dump)
├── config.toml
└── README.md
```

This **YVITY** (user) repo only needs:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Do not add migrations here. Change the database only from **YVITY-Dashboard**.

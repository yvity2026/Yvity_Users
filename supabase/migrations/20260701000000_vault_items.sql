-- Financial Vault: stores all vault items across categories for each user.
-- category: insurance | investments | bank_accounts | fixed_deposits |
--            loans | real_estate | gold | documents | nominees
-- data: JSONB for category-specific fields (schema-less, no migrations per new category)

create table if not exists vault_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  category    text not null,
  title       text not null,
  subtitle    text,
  data        jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_vault_items_user_category
  on vault_items (user_id, category, created_at desc);

create index if not exists idx_vault_items_data_gin
  on vault_items using gin (data);

alter table vault_items enable row level security;

drop policy if exists "Users manage own vault items" on vault_items;
create policy "Users manage own vault items"
  on vault_items for all
  using (user_id = auth.uid());

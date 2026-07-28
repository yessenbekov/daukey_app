-- ============================================================================
-- Услуги клуба (прогулки, кокпар и т.д.) и цены на них — управляются
-- админом из /admin/services, вместо того чтобы быть зашитыми в код
-- страницы /services.
-- ============================================================================

begin;

create table services (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  description text,
  price numeric(12, 2) not null,
  unit text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table services enable row level security;

create policy services_select on services
  for select
  using (is_active = true or is_admin());

create policy services_insert_admin on services
  for insert
  with check (is_admin());

create policy services_update_admin on services
  for update
  using (is_admin())
  with check (is_admin());

create policy services_delete_admin on services
  for delete
  using (is_admin());

commit;

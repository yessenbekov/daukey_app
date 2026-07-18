-- ============================================================================
-- Daukey App: регистрация, роли, привязка лошадей к владельцам, история оплат
-- ============================================================================
-- Скрипт идемпотентный: сначала сносит все объекты этой миграции (если они
-- уже существуют в любом частичном состоянии), затем создаёт всё заново.
-- Безопасно перезапускать сколько угодно раз.
-- Данные в profiles/payments при повторном запуске будут потеряны — если
-- к этому моменту там уже есть данные, которые нужно сохранить, сначала
-- выгрузите их отдельно.
-- Всё обёрнуто в одну транзакцию: если что-то упадёт посередине, ничего не
-- применится частично.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 0. Снос старых объектов (в обратном порядке зависимостей)
-- ----------------------------------------------------------------------------
-- profiles/payments дропаются целиком ниже (DROP TABLE ... CASCADE), поэтому
-- их политики снесутся автоматически вместе с таблицей — отдельный DROP
-- POLICY для них не нужен (и упал бы с ошибкой "relation does not exist",
-- если таблицы уже нет). Явно дропаем только политики на объектах, которые
-- сами НЕ дропаются: horses (это исходная таблица приложения) и
-- storage.objects (управляется Supabase).
drop policy if exists horses_storage_delete_admin on storage.objects;
drop policy if exists horses_storage_update_admin on storage.objects;
drop policy if exists horses_storage_insert_admin on storage.objects;
drop policy if exists horses_storage_select on storage.objects;

drop policy if exists horses_delete_admin on horses;
drop policy if exists horses_update_admin on horses;
drop policy if exists horses_insert_admin on horses;
drop policy if exists horses_select on horses;

alter table if exists horses drop column if exists owner_id;

drop table if exists payments cascade;
drop table if exists profiles cascade;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();
drop function if exists is_admin();

drop type if exists profile_status cascade;
drop type if exists profile_role cascade;

-- ----------------------------------------------------------------------------
-- 1. Enums
-- ----------------------------------------------------------------------------
create type profile_role as enum ('owner', 'admin');
create type profile_status as enum ('pending', 'approved', 'rejected');

-- ----------------------------------------------------------------------------
-- 2. profiles — по одной строке на пользователя auth.users
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role profile_role not null default 'owner',
  status profile_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. Триггер: при регистрации нового пользователя автоматически создаём
--    профиль со статусом pending и ролью owner. Роль/статус не берутся из
--    пользовательского ввода, поэтому пользователь не может выдать себе
--    доступ администратора при регистрации.
-- ----------------------------------------------------------------------------
create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- 4. is_admin() — security definer, чтобы политики RLS на profiles могли
--    её вызывать без бесконечной рекурсии (обычный select внутри политики
--    той же таблицы был бы рекурсивным).
-- ----------------------------------------------------------------------------
create function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin' and status = 'approved'
  );
$$;

-- ----------------------------------------------------------------------------
-- 5. horses.owner_id — nullable, старые лошади остаются без владельца
-- ----------------------------------------------------------------------------
alter table horses
  add column owner_id uuid references profiles (id) on delete set null;

-- ----------------------------------------------------------------------------
-- 6. payments — история платежей по лошади
-- ----------------------------------------------------------------------------
create table payments (
  id uuid primary key default gen_random_uuid(),
  horse_id uuid not null references horses (id) on delete cascade,
  amount numeric(12, 2) not null,
  period text,
  paid_at date not null default current_date,
  note text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 7. Row Level Security
-- ----------------------------------------------------------------------------
alter table profiles enable row level security;
alter table horses enable row level security;
alter table payments enable row level security;

-- --- profiles ---------------------------------------------------------------
create policy profiles_select on profiles
  for select
  using (auth.uid() = id or is_admin());

-- владелец может обновлять только свои full_name/phone, но не role/status
-- (WITH CHECK требует, чтобы новые role/status совпадали с текущими значениями)
create policy profiles_update_self on profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from profiles p where p.id = auth.uid())
    and status = (select p.status from profiles p where p.id = auth.uid())
  );

-- админ может менять любые профили, включая role/status (одобрение, повышение)
create policy profiles_update_admin on profiles
  for update
  using (is_admin())
  with check (is_admin());

-- ----------------------------------------------------------------------------
-- 8. horses — фикс уязвимости: раньше запись не проверялась вообще
-- ----------------------------------------------------------------------------
create policy horses_select on horses
  for select
  using (is_available = true or is_admin() or owner_id = auth.uid());

create policy horses_insert_admin on horses
  for insert
  with check (is_admin());

create policy horses_update_admin on horses
  for update
  using (is_admin())
  with check (is_admin());

create policy horses_delete_admin on horses
  for delete
  using (is_admin());

-- ----------------------------------------------------------------------------
-- 9. payments
-- ----------------------------------------------------------------------------
create policy payments_select on payments
  for select
  using (
    is_admin()
    or exists (
      select 1 from horses h
      where h.id = payments.horse_id and h.owner_id = auth.uid()
    )
  );

create policy payments_insert_admin on payments
  for insert
  with check (is_admin());

create policy payments_update_admin on payments
  for update
  using (is_admin())
  with check (is_admin());

create policy payments_delete_admin on payments
  for delete
  using (is_admin());

-- ----------------------------------------------------------------------------
-- 10. Storage — bucket "horses": фото читаются публично, пишет только админ
-- ----------------------------------------------------------------------------
create policy horses_storage_select on storage.objects
  for select
  using (bucket_id = 'horses');

create policy horses_storage_insert_admin on storage.objects
  for insert
  with check (bucket_id = 'horses' and is_admin());

create policy horses_storage_update_admin on storage.objects
  for update
  using (bucket_id = 'horses' and is_admin())
  with check (bucket_id = 'horses' and is_admin());

create policy horses_storage_delete_admin on storage.objects
  for delete
  using (bucket_id = 'horses' and is_admin());

commit;

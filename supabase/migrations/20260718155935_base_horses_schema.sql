-- ============================================================================
-- Daukey App: базовая таблица horses + storage bucket для фото
-- ============================================================================
-- Проект kokpar_app общий с другими приложениями (Kokpar 3D, Shezhire) —
-- этот файл только ДОБАВЛЯЕТ новые объекты (horses, bucket "horses"),
-- ничего существующего не трогает. Должен применяться раньше
-- 20260718155936_auth_owner_dashboard.sql (та миграция уже ожидает,
-- что таблица horses существует, и добавляет к ней owner_id/RLS).
-- ============================================================================

begin;

create table if not exists horses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  breed text,
  color text,
  height numeric,
  weight numeric,
  description text,
  photos text[] not null default '{}',
  videos text[] not null default '{}',
  is_available boolean not null default true,
  price numeric(12, 2),
  status text,
  year integer,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('horses', 'horses', true)
on conflict (id) do nothing;

commit;

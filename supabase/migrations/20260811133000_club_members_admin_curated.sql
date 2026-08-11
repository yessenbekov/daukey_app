-- ============================================================================
-- Правка по ходу разработки "Члены клуба": пока вкладка видна только
-- админам, и они сами решают, кого показывать в списке — а не "все
-- одобренные автоматом". Добавляем profiles.show_in_members (по умолчанию
-- false — админ явно включает нужных людей) и требуем is_admin() в самой
-- get_club_members(), раз только админы теперь дергают эту функцию из UI.
-- ============================================================================

begin;

alter table profiles
  add column show_in_members boolean not null default false;

-- Как role/status/email/is_active — участник не должен мочь сам себе
-- включить показ в публичном списке членов клуба.
drop policy if exists profiles_update_self on profiles;

create policy profiles_update_self on profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from profiles p where p.id = auth.uid())
    and status = (select p.status from profiles p where p.id = auth.uid())
    and email is not distinct from (select p.email from profiles p where p.id = auth.uid())
    and is_active = (select p.is_active from profiles p where p.id = auth.uid())
    and show_in_members = (select p.show_in_members from profiles p where p.id = auth.uid())
  );

create or replace function public.get_club_members()
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  birth_date date,
  instagram text,
  whatsapp text,
  telegram text
)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.full_name, p.avatar_url, p.birth_date, p.instagram, p.whatsapp, p.telegram
  from profiles p
  where p.status = 'approved'
    and p.is_active = true
    and p.show_in_members = true
    and is_admin()
  order by p.full_name nulls last;
$$;

commit;

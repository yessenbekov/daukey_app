-- ============================================================================
-- Вкладка "Члены клуба": аватар в профиле + список одобренных членов.
--
-- profiles_select уже ограничивает select строкой "auth.uid() = id or
-- is_admin()" — обычный участник не видит чужие профили вообще. Расширять
-- эту политику до "все одобренные видят всех одобренных" означало бы отдать
-- всем колонки профиля целиком (включая email/phone/role/status) любому, кто
-- напрямую обратится к таблице через Supabase client, а не только тем полям,
-- что показывает наш UI — RLS работает на уровне строк, а не колонок.
--
-- Поэтому вместо этого — security definer функция с фиксированным списком
-- колонок (по аналогии с уже существующей is_admin()): она обходит RLS
-- profiles изнутри, но наружу отдаёт только то, что перечислено в RETURNS
-- TABLE. Сама таблица profiles остаётся закрытой как была.
-- ============================================================================

begin;

alter table profiles
  add column avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy avatars_storage_select on storage.objects
  for select
  using (bucket_id = 'avatars');

create policy avatars_storage_insert_own on storage.objects
  for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy avatars_storage_update_own on storage.objects
  for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy avatars_storage_delete_own on storage.objects
  for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
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
    -- вызывающий сам должен быть одобренным активным участником клуба
    and exists (
      select 1 from profiles me
      where me.id = auth.uid()
        and me.status = 'approved'
        and me.is_active = true
    )
  order by p.full_name nulls last;
$$;

grant execute on function public.get_club_members() to authenticated;

commit;

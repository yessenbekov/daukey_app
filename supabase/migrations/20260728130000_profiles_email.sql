-- ============================================================================
-- Добавляем email в profiles. Раньше email был виден только через
-- auth.users (недоступно обычному клиенту/RLS), поэтому админ-таблица
-- пользователей (/admin/users) не могла его показать вообще.
-- ============================================================================

begin;

alter table profiles add column email text;

update profiles p
set email = u.email
from auth.users u
where u.id = p.id;

-- Новые регистрации через обычную форму/Google — email сразу берём из
-- auth.users (это единственный источник правды для email).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, phone, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.email
  );
  return new;
end;
$$;

-- email — как role/status: пользователь не должен иметь возможность
-- подменить его себе через самостоятельный update профиля.
drop policy if exists profiles_update_self on profiles;

create policy profiles_update_self on profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from profiles p where p.id = auth.uid())
    and status = (select p.status from profiles p where p.id = auth.uid())
    and email is not distinct from (select p.email from profiles p where p.id = auth.uid())
  );

commit;

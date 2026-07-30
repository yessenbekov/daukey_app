-- ============================================================================
-- Деактивация аккаунта — отдельно от статуса заявки (pending/approved/
-- rejected), т.к. это разные вещи: status описывает прохождение модерации,
-- is_active — может ли уже одобренный участник пользоваться кабинетом
-- прямо сейчас (админ может временно закрыть доступ, не трогая историю
-- одобрения/платежей).
-- ============================================================================

begin;

alter table profiles add column is_active boolean not null default true;

-- Как email/role/status — пользователь не может сам себя деактивировать
-- или, что важнее, сам себя реактивировать через прямой update.
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
  );

commit;

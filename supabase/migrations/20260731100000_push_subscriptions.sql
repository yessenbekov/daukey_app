-- ============================================================================
-- Push-подписки браузера для уведомлений о новых тренировках. Каждый
-- пользователь регистрирует свою подписку (endpoint уникален — один браузер/
-- устройство). Читать все подписки (чтобы разослать push) может только
-- админ — это не нужен service_role, т.к. рассылка запускается именно
-- админом при создании тренировки, значит его собственная сессия уже
-- проходит is_admin().
-- ============================================================================

begin;

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy push_subscriptions_select_admin on push_subscriptions
  for select
  using (is_admin());

create policy push_subscriptions_insert_self on push_subscriptions
  for insert
  with check (user_id = auth.uid());

create policy push_subscriptions_delete_self on push_subscriptions
  for delete
  using (user_id = auth.uid() or is_admin());

commit;

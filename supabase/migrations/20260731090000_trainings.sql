-- ============================================================================
-- Тренировки по кокпар + голосование "приду/не приду" — раньше велось
-- вручную опросом в WhatsApp. Админ создаёт тренировку (дата/время), любой
-- одобренный участник клуба отмечается +/-, все видят, кто идёт.
--
-- full_name на голосе — это снимок имени на момент голосования, а не join
-- к profiles: у обычных участников нет прав читать чужие profiles (RLS
-- отдаёт только свою строку), а заводить отдельную политику "участники
-- видят имена друг друга" ради одной фичи — лишний риск. Проще и safer
-- хранить имя прямо на голосе.
-- ============================================================================

begin;

create table trainings (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Кокпар',
  starts_at timestamptz not null,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table training_rsvps (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references trainings(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  full_name text not null,
  response text not null check (response in ('yes', 'no')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (training_id, user_id)
);

alter table trainings enable row level security;
alter table training_rsvps enable row level security;

-- Видят тренировки и голоса только одобренные участники клуба (и админ).
create policy trainings_select on trainings
  for select
  using (
    is_admin()
    or exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.status = 'approved'
    )
  );

create policy trainings_admin_write on trainings
  for all
  using (is_admin())
  with check (is_admin());

create policy training_rsvps_select on training_rsvps
  for select
  using (
    is_admin()
    or exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.status = 'approved'
    )
  );

-- Участник может голосовать только за себя.
create policy training_rsvps_upsert_self on training_rsvps
  for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.status = 'approved'
    )
  );

create policy training_rsvps_update_self on training_rsvps
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy training_rsvps_delete_self on training_rsvps
  for delete
  using (user_id = auth.uid() or is_admin());

commit;

-- ============================================================================
-- Видео (Instagram/YouTube), показываемые на странице услуг — раньше был
-- один захардкоженный Instagram-рилс в коде, теперь админ управляет списком
-- сам, как уже сделано для услуг/цен.
-- ============================================================================

begin;

create table service_videos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table service_videos enable row level security;

create policy service_videos_select on service_videos
  for select
  using (is_active = true or is_admin());

create policy service_videos_insert_admin on service_videos
  for insert
  with check (is_admin());

create policy service_videos_update_admin on service_videos
  for update
  using (is_admin())
  with check (is_admin());

create policy service_videos_delete_admin on service_videos
  for delete
  using (is_admin());

commit;

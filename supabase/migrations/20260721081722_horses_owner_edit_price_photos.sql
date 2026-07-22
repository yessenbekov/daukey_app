-- ============================================================================
-- Владелец лошади может редактировать только price и photos своей лошади,
-- через личный кабинет.
-- ============================================================================
-- RLS не умеет ограничивать UPDATE до конкретных колонок напрямую, поэтому
-- WITH CHECK явно требует, чтобы все колонки, кроме price/photos, остались
-- равны своим текущим значениям (сверяем через коррелированный подзапрос
-- к той же строке) — тот же приём, что уже используется для profiles
-- (self-update без права менять role/status).
--
-- Плюс отдельная storage-политика: владелец может загружать новые фото
-- только в свою папку owners/<uid>/..., чтобы связать upload с конкретным
-- пользователем (сам объект storage.objects не знает, какой он лошади).
-- ============================================================================

begin;

create policy horses_update_owner on horses
  for update
  using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and name = (select h.name from horses h where h.id = horses.id)
    and breed is not distinct from (select h.breed from horses h where h.id = horses.id)
    and color is not distinct from (select h.color from horses h where h.id = horses.id)
    and height is not distinct from (select h.height from horses h where h.id = horses.id)
    and weight is not distinct from (select h.weight from horses h where h.id = horses.id)
    and description is not distinct from (select h.description from horses h where h.id = horses.id)
    and videos = (select h.videos from horses h where h.id = horses.id)
    and is_available = (select h.is_available from horses h where h.id = horses.id)
    and status is not distinct from (select h.status from horses h where h.id = horses.id)
    and year is not distinct from (select h.year from horses h where h.id = horses.id)
  );

create policy horses_storage_insert_owner on storage.objects
  for insert
  with check (
    bucket_id = 'horses'
    and (storage.foldername(name))[1] = 'owners'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

commit;

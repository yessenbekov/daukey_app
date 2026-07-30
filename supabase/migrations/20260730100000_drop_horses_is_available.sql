-- ============================================================================
-- horses.is_available никогда не читается нигде в приложении (статус
-- "В продаже"/"Частная лошадь" везде выводится из owner_id) — только
-- пишется как true при создании лошади. Мёртвая колонка, убираем.
-- ============================================================================

begin;

-- Политика владельца пинит is_available к текущему значению — без него
-- удаление колонки сломает policy (ссылка на несуществующую колонку).
drop policy if exists horses_update_owner on horses;

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
    and status is not distinct from (select h.status from horses h where h.id = horses.id)
    and year is not distinct from (select h.year from horses h where h.id = horses.id)
  );

alter table horses drop column is_available;

commit;

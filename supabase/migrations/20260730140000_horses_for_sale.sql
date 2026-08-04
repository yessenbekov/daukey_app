-- ============================================================================
-- Явный параметр "выставлена на продажу" для лошадей без владельца.
-- Раньше "В продаже"/"Частная лошадь" полностью выводилось из owner_id —
-- теперь это раздельные вещи: owner_id всегда даёт "Частная лошадь", а для
-- лошадей без владельца админ сам решает, показывать ли "В продаже"
-- (или не показывать бейдж вообще, если лошадь пока не выставлена).
-- ============================================================================

begin;

alter table horses add column for_sale boolean not null default true;

-- Владелец пинит for_sale к текущему значению через self-edit — это решение
-- админа, не владельца лошади (как и остальные поля кроме price/photos).
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
    and for_sale = (select h.for_sale from horses h where h.id = horses.id)
  );

commit;

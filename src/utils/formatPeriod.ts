const MONTHS_RU = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

// period хранится как "YYYY-MM" (из <input type="month">) — показываем
// человекочитаемо ("Июль 2026"). Старые записи со свободным текстом
// показываем как есть.
export function formatPeriod(period: string | null | undefined): string {
  if (!period) return "—";

  const match = period.match(/^(\d{4})-(\d{2})$/);
  if (!match) return period;

  const [, year, month] = match;
  const monthName = MONTHS_RU[Number(month) - 1];
  return monthName ? `${monthName} ${year}` : period;
}

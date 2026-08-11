// Формат номера в клубе: "+7 702 1234567" (код страны + 10 цифр).
// Если пользователь вставил номер целиком с кодом страны (11 цифр,
// "+77021234567" или "87021234567") — оставляем последние 10 цифр,
// а не срезаем первую цифру вслепую: казахстанские операторские коды
// сами начинаются на "7" (700-778), так что наивная обрезка "лидирующей
// семёрки" ломала бы реальный номер, а не код страны.
export function formatPhoneMask(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  if (digits.length === 0) return "";

  let result = "+7";
  result += ` ${digits.slice(0, 3)}`;
  if (digits.length > 3) result += ` ${digits.slice(3, 10)}`;
  return result;
}

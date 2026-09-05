const ALMATY_OFFSET_MS = 5 * 60 * 60 * 1000; // Asia/Almaty is UTC+5, no DST

/** Start/end (UTC instants) of the Almaty calendar day containing `reference`. */
export function getAlmatyDayBounds(reference: Date = new Date()) {
  const shifted = new Date(reference.getTime() + ALMATY_OFFSET_MS);
  const y = shifted.getUTCFullYear();
  const m = shifted.getUTCMonth();
  const d = shifted.getUTCDate();
  const startUtcMs = Date.UTC(y, m, d, 0, 0, 0) - ALMATY_OFFSET_MS;

  return {
    start: new Date(startUtcMs),
    end: new Date(startUtcMs + 24 * 60 * 60 * 1000),
  };
}

/** "YYYY-MM-DD" key for the Almaty calendar day containing `date`. */
export function getAlmatyDateKey(date: Date) {
  const shifted = new Date(date.getTime() + ALMATY_OFFSET_MS);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateAlmaty(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Asia/Almaty",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateTimeAlmaty(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Asia/Almaty",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatTimeAlmaty(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Asia/Almaty",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** Start/end (UTC instants) of the Almaty calendar month containing year/month (month is 0-indexed). */
export function getAlmatyMonthBounds(year: number, month: number) {
  const startUtcMs = Date.UTC(year, month, 1, 0, 0, 0) - ALMATY_OFFSET_MS;
  const endUtcMs = Date.UTC(year, month + 1, 1, 0, 0, 0) - ALMATY_OFFSET_MS;
  return { start: new Date(startUtcMs), end: new Date(endUtcMs) };
}

/** Number of days in the given Almaty-calendar month (month is 0-indexed). */
export function daysInAlmatyMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** Weekday of the 1st of the given Almaty-calendar month: 0 = Monday .. 6 = Sunday. */
export function firstWeekdayMonFirst(year: number, month: number) {
  const jsDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
  return (jsDay + 6) % 7;
}

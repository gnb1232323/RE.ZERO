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

export function formatDateAlmaty(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Asia/Almaty",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

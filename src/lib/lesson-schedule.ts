/** Generates `count` dates starting from `startDate`, landing only on the given weekdays (0=Sun..6=Sat), at 18:00 local. */
export function generateLessonDates(startDate: Date, weekdays: number[], count: number): Date[] {
  if (weekdays.length === 0 || count <= 0) return [];

  const dates: Date[] = [];
  const cursor = new Date(startDate);
  cursor.setHours(18, 0, 0, 0);

  // cap iterations so a bad input can't loop forever
  const maxIterations = count * 14 + 30;
  let iterations = 0;

  while (dates.length < count && iterations < maxIterations) {
    if (weekdays.includes(cursor.getDay())) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
    iterations++;
  }

  return dates;
}

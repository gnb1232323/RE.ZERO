import Link from "next/link";

const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export type CalendarLesson = { time: string; studentName: string; teacherName?: string };
export type CalendarDay = { day: number; dateKey: string; lessons: CalendarLesson[] };

function toParam(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function LessonCalendar({
  year,
  month,
  leadingBlanks,
  days,
}: {
  year: number;
  month: number;
  leadingBlanks: number;
  days: CalendarDay[];
}) {
  const prev = month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
  const next = month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <Link
          href={`/teaching?m=${toParam(prev.year, prev.month)}`}
          className="transition-smooth flex h-7 w-7 items-center justify-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-800"
          aria-label="Предыдущий месяц"
        >
          ←
        </Link>
        <p className="text-sm font-semibold text-ink-900">
          {MONTH_NAMES[month]} {year}
        </p>
        <Link
          href={`/teaching?m=${toParam(next.year, next.month)}`}
          className="transition-smooth flex h-7 w-7 items-center justify-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-800"
          aria-label="Следующий месяц"
        >
          →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium text-ink-400">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((d) => {
          const hasLessons = d.lessons.length > 0;
          return (
            <div
              key={d.dateKey}
              className={`min-h-[62px] rounded-lg border p-1.5 text-left ${
                hasLessons ? "border-lime-300 bg-lime-50" : "border-ink-100 bg-white"
              }`}
            >
              <p className={`text-xs ${hasLessons ? "font-semibold text-lime-800" : "text-ink-400"}`}>{d.day}</p>
              {d.lessons.slice(0, 3).map((l, i) => (
                <p key={i} className="mt-0.5 truncate text-[10px] leading-tight text-lime-700">
                  {l.time} {l.studentName.split(" ")[0]}
                  {l.teacherName ? ` · ${l.teacherName}` : ""}
                </p>
              ))}
              {d.lessons.length > 3 && <p className="text-[10px] text-lime-600">+{d.lessons.length - 3}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

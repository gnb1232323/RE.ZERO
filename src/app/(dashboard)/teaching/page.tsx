import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { computeEngagement } from "@/lib/engagement";
import {
  formatDateAlmaty,
  formatTimeAlmaty,
  getAlmatyDateKey,
  getAlmatyMonthBounds,
  daysInAlmatyMonth,
  firstWeekdayMonFirst,
} from "@/lib/date";
import { TeacherIcon } from "@/components/icons";
import { LessonCalendar, type CalendarDay } from "@/components/teaching/lesson-calendar";

const riskColors: Record<string, string> = {
  LOW: "bg-lime-100 text-lime-700",
  MEDIUM: "bg-khaki-100 text-khaki-600",
  HIGH: "bg-danger-100 text-danger-600",
};
const riskLabels: Record<string, string> = { LOW: "Низкий риск", MEDIUM: "Средний риск", HIGH: "Высокий риск" };

function parseMonthParam(raw: string | undefined) {
  if (raw && /^\d{4}-\d{2}$/.test(raw)) {
    const [y, m] = raw.split("-").map(Number);
    if (m >= 1 && m <= 12) return { year: y, month: m - 1 };
  }
  const [y, m] = getAlmatyDateKey(new Date()).split("-").map(Number);
  return { year: y, month: m - 1 };
}

export default async function TeachingPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const user = await requireRole("OWNER", "TEACHER");
  const { m } = await searchParams;
  const { year, month } = parseMonthParam(m);

  const contacts = await prisma.contact.findMany({
    where: {
      deletedAt: null,
      student: { isNot: null },
      ...(user.role === "TEACHER" ? { teacherId: user.id } : {}),
    },
    select: {
      id: true,
      fullName: true,
      student: {
        select: {
          id: true,
          code: true,
          lessons: {
            where: { status: "SCHEDULED", scheduledAt: { gte: new Date() } },
            orderBy: { scheduledAt: "asc" },
            take: 1,
            select: { scheduledAt: true },
          },
        },
      },
    },
    orderBy: { fullName: "asc" },
  });

  const rows = await Promise.all(
    contacts.map(async (c) => ({
      contact: c,
      engagement: c.student ? await computeEngagement(c.student.id) : null,
    }))
  );

  const { start, end } = getAlmatyMonthBounds(year, month);
  const monthLessons = await prisma.lessonSlot.findMany({
    where: {
      scheduledAt: { gte: start, lt: end },
      ...(user.role === "TEACHER" ? { teacherId: user.id } : {}),
    },
    orderBy: { scheduledAt: "asc" },
    select: {
      scheduledAt: true,
      student: { select: { contact: { select: { fullName: true } } } },
      teacher: { select: { name: true } },
    },
  });

  const lessonsByDate = new Map<string, { time: string; studentName: string; teacherName?: string }[]>();
  for (const lesson of monthLessons) {
    const key = getAlmatyDateKey(lesson.scheduledAt);
    const list = lessonsByDate.get(key) ?? [];
    list.push({
      time: formatTimeAlmaty(lesson.scheduledAt),
      studentName: lesson.student.contact.fullName,
      teacherName: user.role === "OWNER" ? lesson.teacher?.name : undefined,
    });
    lessonsByDate.set(key, list);
  }

  const totalDays = daysInAlmatyMonth(year, month);
  const leadingBlanks = firstWeekdayMonFirst(year, month);
  const days: CalendarDay[] = Array.from({ length: totalDays }, (_, i) => {
    const day = i + 1;
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return { day, dateKey, lessons: lessonsByDate.get(dateKey) ?? [] };
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Мои ученики</h1>
        <p className="mt-0.5 text-sm text-ink-500">{rows.length} прикреплено</p>
      </div>

      <LessonCalendar year={year} month={month} leadingBlanks={leadingBlanks} days={days} />

      {rows.length === 0 ? (
        <p className="text-sm text-ink-400">Пока нет прикреплённых учеников.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row, i) => (
            <Link
              key={row.contact.id}
              href={`/teaching/${row.contact.id}`}
              style={{ "--stagger-i": i } as React.CSSProperties}
              className="stagger-item card-hover rounded-2xl border border-ink-200 bg-white p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <TeacherIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{row.contact.fullName}</p>
                    <p className="text-xs text-ink-400">Код {row.contact.student?.code}</p>
                  </div>
                </div>
                {row.engagement?.risk && (
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${riskColors[row.engagement.risk]}`}>
                    {riskLabels[row.engagement.risk]}
                  </span>
                )}
              </div>
              {row.contact.student?.lessons[0] && (
                <p className="mt-2.5 text-xs text-ink-500">
                  Ближайший урок: {formatDateAlmaty(row.contact.student.lessons[0].scheduledAt)}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

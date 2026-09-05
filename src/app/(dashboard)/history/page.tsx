import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { formatDateTimeAlmaty } from "@/lib/date";
import type { Prisma } from "@/generated/prisma/client";
import type { ActivityType } from "@/generated/prisma/enums";

const typeLabels: Record<ActivityType, string> = {
  NOTE: "Заметка",
  STAGE_CHANGE: "Смена стадии",
  TASK_CREATED: "Задача создана",
  TASK_COMPLETED: "Задача выполнена",
  SYSTEM: "Система",
};

const typeColors: Record<ActivityType, string> = {
  NOTE: "bg-brand-100 text-brand-700",
  STAGE_CHANGE: "bg-lime-100 text-lime-700",
  TASK_CREATED: "bg-khaki-100 text-khaki-600",
  TASK_COMPLETED: "bg-lime-100 text-lime-700",
  SYSTEM: "bg-ink-100 text-ink-500",
};

const HISTORY_LIMIT = 200;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ authorId?: string; type?: string; from?: string; to?: string; q?: string }>;
}) {
  const user = await requireRole("OWNER");
  const { authorId, type, from, to, q } = await searchParams;

  const where: Prisma.ActivityWhereInput = {
    ...(authorId ? { authorId } : {}),
    ...(type ? { type: type as ActivityType } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(`${from}T00:00:00+05:00`) } : {}),
            ...(to ? { lt: new Date(new Date(`${to}T00:00:00+05:00`).getTime() + 24 * 60 * 60 * 1000) } : {}),
          },
        }
      : {}),
    ...(q ? { contact: { fullName: { contains: q, mode: "insensitive" } } } : {}),
  };

  const [activities, employees] = await Promise.all([
    prisma.activity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: HISTORY_LIMIT,
      select: {
        id: true,
        type: true,
        body: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
        contact: { select: { id: true, fullName: true } },
      },
    }),
    prisma.user.findMany({ where: { deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const hasFilters = Boolean(authorId || type || from || to || q);
  const fieldClass =
    "rounded-lg border border-ink-300 px-2.5 py-1.5 text-sm text-ink-800 outline-none transition-smooth focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">История действий</h1>
        <p className="mt-0.5 text-sm text-ink-500">
          Показано {activities.length}{activities.length === HISTORY_LIMIT ? "+" : ""} записей
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
        <label className="flex flex-col gap-1 text-xs text-ink-500">
          Сотрудник
          <select name="authorId" defaultValue={authorId ?? ""} className={fieldClass}>
            <option value="">Все</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-500">
          Тип
          <select name="type" defaultValue={type ?? ""} className={fieldClass}>
            <option value="">Все</option>
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-500">
          С
          <input type="date" name="from" defaultValue={from ?? ""} className={fieldClass} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-500">
          По
          <input type="date" name="to" defaultValue={to ?? ""} className={fieldClass} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-500">
          Клиент
          <input type="text" name="q" defaultValue={q ?? ""} placeholder="Имя клиента" className={fieldClass} />
        </label>
        <button
          type="submit"
          className="transition-smooth rounded-lg bg-brand-600 px-4 py-1.5 text-sm text-white hover:bg-brand-700 hover:shadow-pop active:scale-[0.98]"
        >
          Применить
        </button>
        {hasFilters && (
          <Link href="/history" className="text-sm text-ink-400 transition-smooth hover:text-ink-700">
            Сбросить
          </Link>
        )}
      </form>

      <div className="rounded-2xl border border-ink-200 bg-white shadow-card">
        {activities.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-400">Ничего не найдено.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {activities.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${typeColors[a.type]}`}>
                      {typeLabels[a.type]}
                    </span>
                    <Link href={`/contacts/${a.contact.id}`} className="truncate text-sm font-medium text-ink-800 hover:text-brand-700">
                      {a.contact.fullName}
                    </Link>
                  </div>
                  <p className="mt-1 truncate text-sm text-ink-600">{a.body}</p>
                </div>
                <div className="flex-shrink-0 text-right text-xs text-ink-400">
                  <p>{a.author.name}</p>
                  <p>{formatDateTimeAlmaty(a.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

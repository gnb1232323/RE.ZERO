import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { stageColors, stageLabels, stageOrder } from "@/lib/labels";
import { getAlmatyDayBounds, formatDateAlmaty } from "@/lib/date";

export default async function DashboardPage() {
  const [stageCounts, overdueTasks, todayTasks] = await Promise.all([
    prisma.contact.groupBy({
      by: ["stage"],
      where: { deletedAt: null },
      _count: true,
    }),
    getOverdueTasks(),
    getTodayTasks(),
  ]);

  const countByStage = Object.fromEntries(
    stageCounts.map((row) => [row.stage, row._count])
  ) as Record<string, number>;

  const totalContacts = stageCounts.reduce((sum, row) => sum + row._count, 0);
  const paidOrLater = stageOrder
    .slice(stageOrder.indexOf("PAID_ENROLLED"))
    .filter((s) => s !== "LOST")
    .reduce((sum, stage) => sum + (countByStage[stage] ?? 0), 0);
  const conversionRate = totalContacts > 0 ? Math.round((paidOrLater / totalContacts) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-brand-800">Дашборд</h1>
        <p className="text-sm text-khaki-500">
          {totalContacts} контактов в базе · конверсия в оплату {conversionRate}%
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium text-khaki-700">Контакты по стадиям</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stageOrder.map((stage) => (
            <Link
              key={stage}
              href={`/contacts?stage=${stage}`}
              className={`rounded-lg border-l-4 border border-khaki-200 bg-white p-4 transition hover:shadow-sm ${stageColors[stage].border}`}
            >
              <div className="text-2xl font-semibold text-brand-800">
                {countByStage[stage] ?? 0}
              </div>
              <div className={`flex items-center gap-1.5 text-xs ${stageColors[stage].text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${stageColors[stage].dot}`} />
                {stageLabels[stage]}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <TaskWidget title="Просроченные задачи" tasks={overdueTasks} emptyText="Нет просроченных задач" />
        <TaskWidget title="Задачи на сегодня" tasks={todayTasks} emptyText="На сегодня задач нет" />
      </section>
    </div>
  );
}

async function getOverdueTasks() {
  const { start } = getAlmatyDayBounds();
  return prisma.task.findMany({
    where: { status: "OPEN", dueAt: { lt: start } },
    include: { contact: { select: { id: true, fullName: true } } },
    orderBy: { dueAt: "asc" },
    take: 10,
  });
}

async function getTodayTasks() {
  const { start, end } = getAlmatyDayBounds();
  return prisma.task.findMany({
    where: { status: "OPEN", dueAt: { gte: start, lt: end } },
    include: { contact: { select: { id: true, fullName: true } } },
    orderBy: { dueAt: "asc" },
    take: 10,
  });
}

type TaskRow = Awaited<ReturnType<typeof getOverdueTasks>>[number];

function TaskWidget({
  title,
  tasks,
  emptyText,
}: {
  title: string;
  tasks: TaskRow[];
  emptyText: string;
}) {
  return (
    <div className="rounded-lg border border-khaki-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-medium text-khaki-700">{title}</h2>
      {tasks.length === 0 ? (
        <p className="text-sm text-khaki-400">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="text-sm">
              <Link href={`/contacts/${task.contact.id}`} className="text-brand-800 hover:underline">
                {task.title}
              </Link>
              <span className="ml-2 text-khaki-400">
                {task.contact.fullName} · {formatDateAlmaty(task.dueAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

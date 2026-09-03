import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { stageColors, stageLabels, stageOrder } from "@/lib/labels";
import { getAlmatyDayBounds, formatDateAlmaty } from "@/lib/date";
import { ContactsIcon, TrendUpIcon, CoinsIcon, ClockIcon, AlertIcon } from "@/components/icons";
import { formatMoney } from "@/lib/money";

export default async function DashboardPage() {
  const [stageCounts, overdueTasks, todayTasks, studentCount, students] = await Promise.all([
    prisma.contact.groupBy({
      by: ["stage"],
      where: { deletedAt: null },
      _count: true,
    }),
    getOverdueTasks(),
    getTodayTasks(),
    prisma.student.count(),
    prisma.student.findMany({
      where: { contact: { deletedAt: null } },
      select: { paymentAmount: true, contact: { select: { stage: true } } },
    }),
  ]);

  const countByStage = Object.fromEntries(
    stageCounts.map((row) => [row.stage, row._count])
  ) as Record<string, number>;

  const valueByStage: Record<string, number> = {};
  for (const s of students) {
    const stage = s.contact.stage;
    valueByStage[stage] = (valueByStage[stage] ?? 0) + Number(s.paymentAmount);
  }
  const totalValue = students.reduce((sum, s) => sum + Number(s.paymentAmount), 0);

  const totalContacts = stageCounts.reduce((sum, row) => sum + row._count, 0);
  const paidOrLater = stageOrder
    .slice(stageOrder.indexOf("PAID_ENROLLED"))
    .filter((s) => s !== "LOST")
    .reduce((sum, stage) => sum + (countByStage[stage] ?? 0), 0);
  const conversionRate = totalContacts > 0 ? Math.round((paidOrLater / totalContacts) * 100) : 0;
  const funnelStages = stageOrder.filter((s) => s !== "LOST");
  const maxFunnelCount = Math.max(1, ...funnelStages.map((s) => countByStage[s] ?? 0));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Дашборд</h1>
        <p className="mt-0.5 text-sm text-ink-500">Сводка по воронке и задачам на сегодня</p>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={ContactsIcon} label="Контактов в базе" value={totalContacts} tone="brand" href="/contacts" />
        <StatCard
          icon={CoinsIcon}
          label="Студентов"
          value={studentCount}
          sublabel={totalValue > 0 ? formatMoney(totalValue) : undefined}
          tone="lime"
          href="/contacts?hasStudent=true"
        />
        <StatCard icon={TrendUpIcon} label="Конверсия в оплату" value={`${conversionRate}%`} tone="khaki" href="/contacts?hasStudent=true" />
        <StatCard
          icon={AlertIcon}
          label="Просрочено задач"
          value={overdueTasks.length}
          tone={overdueTasks.length > 0 ? "danger" : "ink"}
          href="/tasks"
        />
      </section>

      <section className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
        <h2 className="mb-4 text-sm font-semibold text-ink-800">Воронка продаж</h2>
        <div className="space-y-2.5">
          {funnelStages.map((stage) => {
            const count = countByStage[stage] ?? 0;
            const widthPct = Math.max(4, Math.round((count / maxFunnelCount) * 100));
            return (
              <Link
                key={stage}
                href={`/contacts?stage=${stage}`}
                className="group flex items-center gap-3 rounded-md py-1 transition hover:bg-ink-50"
              >
                <span className="w-40 flex-shrink-0 truncate text-sm text-ink-600 group-hover:text-ink-900">
                  {stageLabels[stage]}
                </span>
                <span className="h-5 flex-1 overflow-hidden rounded bg-ink-100">
                  <span
                    className={`block h-full rounded ${stageColors[stage].dot} transition-all`}
                    style={{ width: `${widthPct}%` }}
                  />
                </span>
                {valueByStage[stage] ? (
                  <span className="hidden w-28 flex-shrink-0 truncate text-right text-xs text-ink-400 sm:block">
                    {formatMoney(valueByStage[stage])}
                  </span>
                ) : (
                  <span className="hidden w-28 flex-shrink-0 sm:block" />
                )}
                <span className="w-8 flex-shrink-0 text-right text-sm font-semibold text-ink-800">{count}</span>
              </Link>
            );
          })}
          {(countByStage.LOST ?? 0) > 0 && (
            <Link
              href="/contacts?stage=LOST"
              className="group flex items-center gap-3 rounded-md py-1 pt-2 border-t border-ink-100 transition hover:bg-ink-50"
            >
              <span className="w-40 flex-shrink-0 truncate text-sm text-danger-600">{stageLabels.LOST}</span>
              <span className="flex-1" />
              <span className="w-8 flex-shrink-0 text-right text-sm font-semibold text-danger-600">
                {countByStage.LOST}
              </span>
            </Link>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <TaskWidget
          title="Просроченные задачи"
          icon={AlertIcon}
          tone="danger"
          tasks={overdueTasks}
          emptyText="Нет просроченных задач"
          href="/tasks"
        />
        <TaskWidget
          title="Задачи на сегодня"
          icon={ClockIcon}
          tone="brand"
          tasks={todayTasks}
          emptyText="На сегодня задач нет"
          href="/tasks"
        />
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
type Tone = "brand" | "lime" | "khaki" | "danger" | "ink";

const toneClasses: Record<Tone, { bg: string; text: string }> = {
  brand: { bg: "bg-brand-100", text: "text-brand-700" },
  lime: { bg: "bg-lime-100", text: "text-lime-700" },
  khaki: { bg: "bg-khaki-100", text: "text-khaki-600" },
  danger: { bg: "bg-danger-100", text: "text-danger-600" },
  ink: { bg: "bg-ink-100", text: "text-ink-500" },
};

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  tone,
  href,
}: {
  icon: (props: { className?: string }) => React.ReactElement;
  label: string;
  value: string | number;
  sublabel?: string;
  tone: Tone;
  href?: string;
}) {
  const colors = toneClasses[tone];
  const content = (
    <>
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${colors.bg} ${colors.text}`}>
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold text-ink-900">{value}</span>
        {sublabel && <span className="text-xs text-ink-400">{sublabel}</span>}
      </div>
      <div className="text-xs text-ink-500">{label}</div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-xl border border-ink-200 bg-white p-4 shadow-card transition hover:shadow-pop hover:border-ink-300">
        {content}
      </Link>
    );
  }

  return <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-card">{content}</div>;
}

function TaskWidget({
  title,
  icon: Icon,
  tone,
  tasks,
  emptyText,
  href,
}: {
  title: string;
  icon: (props: { className?: string }) => React.ReactElement;
  tone: Tone;
  tasks: TaskRow[];
  emptyText: string;
  href?: string;
}) {
  const colors = toneClasses[tone];
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
      {href ? (
        <h2 className="mb-3">
          <Link href={href} className="group flex items-center gap-2 text-sm font-semibold text-ink-800 hover:text-brand-700">
            <span className={`flex h-6 w-6 items-center justify-center rounded-md ${colors.bg} ${colors.text}`}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            {title}
            <span className="ml-auto text-xs font-normal text-ink-400 group-hover:text-brand-600">Все задачи →</span>
          </Link>
        </h2>
      ) : (
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-800">
          <span className={`flex h-6 w-6 items-center justify-center rounded-md ${colors.bg} ${colors.text}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          {title}
        </h2>
      )}
      {tasks.length === 0 ? (
        <p className="text-sm text-ink-400">{emptyText}</p>
      ) : (
        <ul className="space-y-1">
          {tasks.map((task) => (
            <li key={task.id} className="rounded-md px-2 py-1.5 text-sm transition hover:bg-ink-50">
              <Link href={`/contacts/${task.contact.id}`} className="font-medium text-ink-800 hover:text-brand-700">
                {task.title}
              </Link>
              <span className="ml-2 text-ink-400">
                {task.contact.fullName} · {formatDateAlmaty(task.dueAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

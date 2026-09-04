import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { stageColors, stageLabels, stageOrder } from "@/lib/labels";
import { getAlmatyDayBounds, getAlmatyDateKey, formatDateAlmaty } from "@/lib/date";
import { ContactsIcon, TrendUpIcon, CoinsIcon, ClockIcon, AlertIcon } from "@/components/icons";
import { formatMoney } from "@/lib/money";

const LEADS_CHART_DAYS = 14;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const role = user?.role ?? "OWNER";
  const canSeeMoney = role !== "SALES";
  const canSeeContactsLinks = role !== "MARKETING";
  const canSeeTasks = role !== "MARKETING";

  const [stageCounts, overdueTasks, todayTasks, studentCount, students, recentLeads] = await Promise.all([
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
    getRecentLeads(),
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

  const leadsByDay = new Map<string, number>();
  for (const lead of recentLeads) {
    const key = getAlmatyDateKey(lead.createdAt);
    leadsByDay.set(key, (leadsByDay.get(key) ?? 0) + 1);
  }
  const leadsChartDays = Array.from({ length: LEADS_CHART_DAYS }, (_, i) => {
    const date = new Date(Date.now() - (LEADS_CHART_DAYS - 1 - i) * 24 * 60 * 60 * 1000);
    const key = getAlmatyDateKey(date);
    return { key, count: leadsByDay.get(key) ?? 0, date };
  });
  const maxLeadsCount = Math.max(1, ...leadsChartDays.map((d) => d.count));
  const totalRecentLeads = leadsChartDays.reduce((sum, d) => sum + d.count, 0);

  const greeting = getGreeting();

  return (
    <div className="space-y-8">
      <div className="animate-fade-in">
        <p className="text-sm font-medium text-brand-600">{greeting}, {user?.name ?? ""}</p>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-ink-900">Дашборд</h1>
        <p className="mt-1 text-sm text-ink-500">Сводка по воронке и задачам на сегодня</p>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={ContactsIcon}
          label="Контактов в базе"
          value={totalContacts}
          tone="brand"
          href={canSeeContactsLinks ? "/contacts" : undefined}
          index={0}
        />
        <StatCard
          icon={CoinsIcon}
          label="Студентов"
          value={studentCount}
          sublabel={canSeeMoney && totalValue > 0 ? formatMoney(totalValue) : undefined}
          tone="lime"
          href={canSeeContactsLinks ? "/contacts?hasStudent=true" : undefined}
          index={1}
        />
        <StatCard
          icon={TrendUpIcon}
          label="Конверсия в оплату"
          value={`${conversionRate}%`}
          tone="khaki"
          href={canSeeContactsLinks ? "/contacts?hasStudent=true" : undefined}
          index={2}
        />
        {canSeeTasks && (
          <StatCard
            icon={AlertIcon}
            label="Просрочено задач"
            value={overdueTasks.length}
            tone={overdueTasks.length > 0 ? "danger" : "ink"}
            href="/tasks"
            index={3}
          />
        )}
      </section>

      <section className="card-hover rounded-2xl border border-ink-200 bg-white p-5 shadow-card sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-100 text-brand-700">
            <TrendUpIcon className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-sm font-semibold text-ink-800">Воронка продаж</h2>
        </div>
        <div className="space-y-1">
          {funnelStages.map((stage, i) => {
            const count = countByStage[stage] ?? 0;
            const widthPct = Math.max(3, Math.round((count / maxFunnelCount) * 100));
            const rowContent = (
              <>
                <span className="w-36 flex-shrink-0 truncate text-sm text-ink-600 group-hover:text-ink-900 sm:w-40">
                  {stageLabels[stage]}
                </span>
                <span className="h-6 flex-1 overflow-hidden rounded-full bg-ink-100">
                  <span
                    className={`block h-full rounded-full ${stageColors[stage].dot} transition-[width] duration-700`}
                    style={{ width: `${widthPct}%`, transitionTimingFunction: "var(--ease-out)" }}
                  />
                </span>
                {canSeeMoney && valueByStage[stage] ? (
                  <span className="hidden w-28 flex-shrink-0 truncate text-right text-xs text-ink-400 sm:block">
                    {formatMoney(valueByStage[stage])}
                  </span>
                ) : (
                  <span className="hidden w-28 flex-shrink-0 sm:block" />
                )}
                <span className="w-8 flex-shrink-0 text-right text-sm font-semibold text-ink-800">{count}</span>
              </>
            );
            const rowClass = "stagger-item transition-smooth group flex items-center gap-3 rounded-lg px-2 py-1.5 -mx-2";
            return canSeeContactsLinks ? (
              <Link key={stage} href={`/contacts?stage=${stage}`} className={`${rowClass} hover:bg-ink-50`} style={{ "--stagger-i": i } as React.CSSProperties}>
                {rowContent}
              </Link>
            ) : (
              <div key={stage} className={rowClass} style={{ "--stagger-i": i } as React.CSSProperties}>
                {rowContent}
              </div>
            );
          })}
          {(countByStage.LOST ?? 0) > 0 &&
            (canSeeContactsLinks ? (
              <Link
                href="/contacts?stage=LOST"
                className="transition-smooth group -mx-2 mt-1 flex items-center gap-3 rounded-lg border-t border-ink-100 px-2 py-1.5 pt-3 hover:bg-danger-100/40"
              >
                <span className="w-36 flex-shrink-0 truncate text-sm text-danger-600 sm:w-40">{stageLabels.LOST}</span>
                <span className="flex-1" />
                <span className="w-8 flex-shrink-0 text-right text-sm font-semibold text-danger-600">
                  {countByStage.LOST}
                </span>
              </Link>
            ) : (
              <div className="-mx-2 mt-1 flex items-center gap-3 border-t border-ink-100 px-2 py-1.5 pt-3">
                <span className="w-36 flex-shrink-0 truncate text-sm text-danger-600 sm:w-40">{stageLabels.LOST}</span>
                <span className="flex-1" />
                <span className="w-8 flex-shrink-0 text-right text-sm font-semibold text-danger-600">
                  {countByStage.LOST}
                </span>
              </div>
            ))}
        </div>
      </section>

      <section className="card-hover rounded-2xl border border-ink-200 bg-white p-5 shadow-card sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-lime-100 text-lime-700">
              <ContactsIcon className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-sm font-semibold text-ink-800">Новые лиды за {LEADS_CHART_DAYS} дней</h2>
          </div>
          <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-500">Всего: {totalRecentLeads}</span>
        </div>
        {totalRecentLeads === 0 ? (
          <p className="text-sm text-ink-400">Пока нет новых лидов за этот период</p>
        ) : (
          <div className="flex h-32 items-end gap-1.5 sm:gap-2">
            {leadsChartDays.map((day, i) => {
              const heightPct = Math.max(4, Math.round((day.count / maxLeadsCount) * 100));
              return (
                <div key={day.key} className="group flex flex-1 flex-col items-center gap-1">
                  {day.count > 0 && <span className="text-[10px] font-medium text-ink-600">{day.count}</span>}
                  <div className="flex h-20 w-full items-end">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${day.count > 0 ? "bg-brand-500 group-hover:bg-brand-600" : "bg-ink-100"}`}
                      style={{
                        height: `${day.count > 0 ? heightPct : 6}%`,
                        transitionTimingFunction: "var(--ease-out)",
                        transitionDelay: `${i * 20}ms`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-ink-400">
                    {new Intl.DateTimeFormat("ru-RU", { timeZone: "Asia/Almaty", day: "2-digit", month: "2-digit" }).format(day.date)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {canSeeTasks && (
        <section className="grid gap-4 lg:grid-cols-2">
          <TaskWidget
            title="Просроченные задачи"
            icon={AlertIcon}
            tone="danger"
            tasks={overdueTasks}
            emptyText="Нет просроченных задач — красота"
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
      )}
    </div>
  );
}

function getGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat("ru-RU", { timeZone: "Asia/Almaty", hour: "2-digit", hour12: false }).format(new Date())
  );
  if (hour < 5) return "Доброй ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

async function getRecentLeads() {
  const since = new Date(Date.now() - LEADS_CHART_DAYS * 24 * 60 * 60 * 1000);
  return prisma.contact.findMany({
    where: { deletedAt: null, createdAt: { gte: since } },
    select: { createdAt: true },
  });
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
  index = 0,
}: {
  icon: (props: { className?: string }) => React.ReactElement;
  label: string;
  value: string | number;
  sublabel?: string;
  tone: Tone;
  href?: string;
  index?: number;
}) {
  const colors = toneClasses[tone];
  const content = (
    <>
      <div className={`mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}>
        <Icon className="h-[19px] w-[19px]" />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[26px] font-semibold leading-none tracking-tight text-ink-900">{value}</span>
        {sublabel && <span className="text-xs text-ink-400">{sublabel}</span>}
      </div>
      <div className="mt-1.5 text-xs text-ink-500">{label}</div>
    </>
  );
  const style = { "--stagger-i": index } as React.CSSProperties;

  if (href) {
    return (
      <Link
        href={href}
        style={style}
        className="stagger-item card-hover block rounded-2xl border border-ink-200 bg-white p-4 shadow-card hover:border-ink-300 sm:p-4.5"
      >
        {content}
      </Link>
    );
  }

  return (
    <div style={style} className="stagger-item rounded-2xl border border-ink-200 bg-white p-4 shadow-card sm:p-4.5">
      {content}
    </div>
  );
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
    <div className="card-hover rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
      {href ? (
        <h2 className="mb-3.5">
          <Link href={href} className="group flex items-center gap-2 text-sm font-semibold text-ink-800 hover:text-brand-700">
            <span className={`flex h-6 w-6 items-center justify-center rounded-md ${colors.bg} ${colors.text}`}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            {title}
            <span className="ml-auto flex items-center gap-0.5 text-xs font-normal text-ink-400 group-hover:text-brand-600">
              Все задачи
              <svg viewBox="0 0 12 12" className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </span>
          </Link>
        </h2>
      ) : (
        <h2 className="mb-3.5 flex items-center gap-2 text-sm font-semibold text-ink-800">
          <span className={`flex h-6 w-6 items-center justify-center rounded-md ${colors.bg} ${colors.text}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          {title}
        </h2>
      )}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg bg-ink-50/60 py-6 text-center">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-100 text-lime-600">
            <svg viewBox="0 0 16 16" className="h-4 w-4">
              <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </span>
          <p className="text-sm text-ink-400">{emptyText}</p>
        </div>
      ) : (
        <ul className="space-y-0.5">
          {tasks.map((task, i) => (
            <li
              key={task.id}
              style={{ "--stagger-i": i } as React.CSSProperties}
              className="stagger-item transition-smooth -mx-2 rounded-lg px-2 py-1.5 text-sm hover:bg-ink-50"
            >
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

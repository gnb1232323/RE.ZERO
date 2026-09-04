import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { formatMoney } from "@/lib/money";
import { sourceLabels, paymentStatusLabels } from "@/lib/labels";
import { CoinsIcon, TrendUpIcon } from "@/components/icons";
import type { LeadSource, PaymentStatus } from "@/generated/prisma/enums";

const statusToneClasses: Record<PaymentStatus, { bg: string; text: string; dot: string }> = {
  PAID: { bg: "bg-lime-100", text: "text-lime-700", dot: "bg-lime-500" },
  PARTIAL: { bg: "bg-khaki-100", text: "text-khaki-600", dot: "bg-khaki-400" },
  UNPAID: { bg: "bg-danger-100", text: "text-danger-600", dot: "bg-danger-500" },
};

const monthNames = [
  "янв", "фев", "мар", "апр", "май", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек",
];

export default async function FinancePage() {
  const user = await requireRole("OWNER", "MARKETING");
  const canDrillIntoContacts = user.role === "OWNER";

  const [students, contactsBySource] = await Promise.all([
    prisma.student.findMany({
      where: { contact: { deletedAt: null } },
      select: {
        paymentAmount: true,
        paymentStatus: true,
        courseStartDate: true,
        contact: { select: { id: true, fullName: true, source: true } },
      },
      orderBy: { courseStartDate: "desc" },
    }),
    prisma.contact.groupBy({
      by: ["source"],
      where: { deletedAt: null },
      _count: true,
    }),
  ]);

  const contactCountBySource = Object.fromEntries(
    contactsBySource.map((row) => [row.source, row._count])
  ) as Record<LeadSource, number>;

  const studentCountBySource: Partial<Record<LeadSource, number>> = {};
  const totalByStatus: Record<PaymentStatus, { sum: number; count: number }> = {
    PAID: { sum: 0, count: 0 },
    PARTIAL: { sum: 0, count: 0 },
    UNPAID: { sum: 0, count: 0 },
  };
  const byMonth = new Map<string, number>();

  for (const s of students) {
    const amount = Number(s.paymentAmount);
    totalByStatus[s.paymentStatus].sum += amount;
    totalByStatus[s.paymentStatus].count += 1;

    const source = s.contact.source;
    studentCountBySource[source] = (studentCountBySource[source] ?? 0) + 1;

    const d = s.courseStartDate;
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + amount);
  }

  const totalRevenue = totalByStatus.PAID.sum + totalByStatus.PARTIAL.sum + totalByStatus.UNPAID.sum;

  const conversionBySource = (Object.keys(sourceLabels) as LeadSource[])
    .map((source) => {
      const contactCount = contactCountBySource[source] ?? 0;
      const studentCount = studentCountBySource[source] ?? 0;
      const rate = contactCount > 0 ? Math.round((studentCount / contactCount) * 100) : 0;
      return { source, contactCount, studentCount, rate };
    })
    .filter((row) => row.contactCount > 0)
    .sort((a, b) => b.rate - a.rate);

  const monthRows = Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-9);
  const maxMonthValue = Math.max(1, ...monthRows.map(([, v]) => v));

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Финансы</h1>
        <p className="mt-0.5 text-sm text-ink-500">Оплаты студентов и конверсия по источникам</p>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MoneyStat
          label="Всего по студентам"
          value={totalRevenue}
          tone="brand"
          href={canDrillIntoContacts ? "/contacts?hasStudent=true" : undefined}
          index={0}
        />
        <MoneyStat
          label={paymentStatusLabels.PAID}
          value={totalByStatus.PAID.sum}
          count={totalByStatus.PAID.count}
          tone="PAID"
          href={canDrillIntoContacts ? "/contacts?paymentStatus=PAID" : undefined}
          index={1}
        />
        <MoneyStat
          label={paymentStatusLabels.PARTIAL}
          value={totalByStatus.PARTIAL.sum}
          count={totalByStatus.PARTIAL.count}
          tone="PARTIAL"
          href={canDrillIntoContacts ? "/contacts?paymentStatus=PARTIAL" : undefined}
          index={2}
        />
        <MoneyStat
          label={paymentStatusLabels.UNPAID}
          value={totalByStatus.UNPAID.sum}
          count={totalByStatus.UNPAID.count}
          tone="UNPAID"
          href={canDrillIntoContacts ? "/contacts?paymentStatus=UNPAID" : undefined}
          index={3}
        />
      </section>

      <section className="card-hover rounded-2xl border border-ink-200 bg-white p-5 shadow-card sm:p-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-100 text-brand-700">
            <TrendUpIcon className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-sm font-semibold text-ink-800">Конверсия в оплату по источникам</h2>
        </div>
        <p className="mb-4 pl-8 text-xs text-ink-400">Доля контактов из каждого источника, ставших студентами</p>
        {conversionBySource.length === 0 ? (
          <p className="text-sm text-ink-400">Пока нет данных</p>
        ) : (
          <div className="space-y-1">
            {conversionBySource.map((row, i) => {
              const rowContent = (
                <>
                  <span className="w-20 flex-shrink-0 truncate text-sm text-ink-600 group-hover:text-ink-900 sm:w-28">
                    {sourceLabels[row.source]}
                  </span>
                  <span className="h-6 flex-1 overflow-hidden rounded-full bg-ink-100">
                    <span
                      className="block h-full rounded-full bg-brand-500 transition-[width] duration-700"
                      style={{ width: `${Math.max(2, row.rate)}%`, transitionTimingFunction: "var(--ease-out)" }}
                    />
                  </span>
                  <span className="hidden w-28 flex-shrink-0 text-right text-xs text-ink-400 sm:block">
                    {row.studentCount} из {row.contactCount}
                  </span>
                  <span className="w-10 flex-shrink-0 text-right text-sm font-semibold text-ink-800">{row.rate}%</span>
                </>
              );
              const rowClass = "stagger-item transition-smooth group -mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5";
              return canDrillIntoContacts ? (
                <Link key={row.source} href={`/contacts?source=${row.source}`} className={`${rowClass} hover:bg-ink-50`} style={{ "--stagger-i": i } as React.CSSProperties}>
                  {rowContent}
                </Link>
              ) : (
                <div key={row.source} className={rowClass} style={{ "--stagger-i": i } as React.CSSProperties}>
                  {rowContent}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="card-hover rounded-2xl border border-ink-200 bg-white p-5 shadow-card sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-lime-100 text-lime-700">
            <CoinsIcon className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-sm font-semibold text-ink-800">Выручка по месяцам</h2>
        </div>
        {monthRows.length === 0 ? (
          <p className="text-sm text-ink-400">Пока нет данных</p>
        ) : (
          <div className="flex h-40 items-end gap-3">
            {monthRows.map(([key, value], i) => {
              const [year, month] = key.split("-");
              const heightPct = Math.max(4, Math.round((value / maxMonthValue) * 100));
              return (
                <div key={key} className="group flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[11px] font-medium text-ink-600">{formatMoney(value)}</span>
                  <div className="flex h-28 w-full items-end">
                    <div
                      className="w-full rounded-t-md bg-brand-500 transition-all duration-500 group-hover:bg-brand-600"
                      style={{ height: `${heightPct}%`, transitionTimingFunction: "var(--ease-out)", transitionDelay: `${i * 30}ms` }}
                    />
                  </div>
                  <span className="text-[11px] text-ink-400">
                    {monthNames[Number(month) - 1]} {year.slice(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {canDrillIntoContacts && (
        <section className="card-hover overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card">
          <h2 className="border-b border-ink-100 px-5 py-4 text-sm font-semibold text-ink-800">Оплаты студентов</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-200 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
                <tr>
                  <th className="px-5 py-3">Студент</th>
                  <th className="px-5 py-3">Начало курса</th>
                  <th className="px-5 py-3">Источник</th>
                  <th className="px-5 py-3">Сумма</th>
                  <th className="px-5 py-3">Статус</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-ink-400">
                      Студентов пока нет
                    </td>
                  </tr>
                )}
                {students.map((s, i) => {
                  const colors = statusToneClasses[s.paymentStatus];
                  const href = `/contacts/${s.contact.id}`;
                  return (
                    <tr
                      key={i}
                      style={{ "--stagger-i": Math.min(i, 12) } as React.CSSProperties}
                      className="stagger-item transition-smooth cursor-pointer border-b border-ink-100 last:border-0 hover:bg-ink-50"
                    >
                      <td className="p-0">
                        <Link href={href} className="block px-5 py-2.5 font-medium text-ink-800 hover:text-brand-700">
                          {s.contact.fullName}
                        </Link>
                      </td>
                      <td className="p-0">
                        <Link href={href} className="block px-5 py-2.5 text-ink-600">
                          {new Intl.DateTimeFormat("ru-RU", { timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric" }).format(
                            s.courseStartDate
                          )}
                        </Link>
                      </td>
                      <td className="p-0">
                        <Link href={href} className="block px-5 py-2.5 text-ink-600">
                          {sourceLabels[s.contact.source]}
                        </Link>
                      </td>
                      <td className="p-0">
                        <Link href={href} className="block px-5 py-2.5 font-medium text-ink-800">
                          {formatMoney(s.paymentAmount.toString())}
                        </Link>
                      </td>
                      <td className="p-0">
                        <Link href={href} className="flex items-center px-5 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                            {paymentStatusLabels[s.paymentStatus]}
                          </span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function MoneyStat({
  label,
  value,
  count,
  tone,
  href,
  index = 0,
}: {
  label: string;
  value: number;
  count?: number;
  tone: "brand" | PaymentStatus;
  href?: string;
  index?: number;
}) {
  const colors =
    tone === "brand"
      ? { bg: "bg-brand-100", text: "text-brand-700" }
      : { bg: statusToneClasses[tone].bg, text: statusToneClasses[tone].text };
  const content = (
    <>
      <div className={`mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}>
        <CoinsIcon className="h-[19px] w-[19px]" />
      </div>
      <div className="text-[22px] font-semibold leading-none tracking-tight text-ink-900">{formatMoney(value)}</div>
      <div className="mt-1.5 text-xs text-ink-500">
        {label}
        {count !== undefined ? ` · ${count}` : ""}
      </div>
    </>
  );
  const style = { "--stagger-i": index } as React.CSSProperties;

  if (href) {
    return (
      <Link href={href} style={style} className="stagger-item card-hover block rounded-2xl border border-ink-200 bg-white p-4 shadow-card hover:border-ink-300 sm:p-4.5">
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

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { sourceLabels, paymentStatusLabels } from "@/lib/labels";
import { CoinsIcon } from "@/components/icons";
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
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Финансы</h1>
        <p className="mt-0.5 text-sm text-ink-500">Оплаты студентов и конверсия по источникам</p>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MoneyStat label="Всего по студентам" value={totalRevenue} tone="brand" href="/contacts?hasStudent=true" />
        <MoneyStat label={paymentStatusLabels.PAID} value={totalByStatus.PAID.sum} count={totalByStatus.PAID.count} tone="PAID" href="/contacts?paymentStatus=PAID" />
        <MoneyStat label={paymentStatusLabels.PARTIAL} value={totalByStatus.PARTIAL.sum} count={totalByStatus.PARTIAL.count} tone="PARTIAL" href="/contacts?paymentStatus=PARTIAL" />
        <MoneyStat label={paymentStatusLabels.UNPAID} value={totalByStatus.UNPAID.sum} count={totalByStatus.UNPAID.count} tone="UNPAID" href="/contacts?paymentStatus=UNPAID" />
      </section>

      <section className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
        <h2 className="mb-1 text-sm font-semibold text-ink-800">Конверсия в оплату по источникам</h2>
        <p className="mb-4 text-xs text-ink-400">Доля контактов из каждого источника, ставших студентами</p>
        {conversionBySource.length === 0 ? (
          <p className="text-sm text-ink-400">Пока нет данных</p>
        ) : (
          <div className="space-y-2.5">
            {conversionBySource.map((row) => (
              <Link
                key={row.source}
                href={`/contacts?source=${row.source}`}
                className="group flex items-center gap-3 rounded-md py-1 transition hover:bg-ink-50"
              >
                <span className="w-20 flex-shrink-0 truncate text-sm text-ink-600 group-hover:text-ink-900 sm:w-28">
                  {sourceLabels[row.source]}
                </span>
                <span className="h-5 flex-1 overflow-hidden rounded bg-ink-100">
                  <span
                    className="block h-full rounded bg-brand-500 transition-all"
                    style={{ width: `${Math.max(2, row.rate)}%` }}
                  />
                </span>
                <span className="hidden w-28 flex-shrink-0 text-right text-xs text-ink-400 sm:block">
                  {row.studentCount} из {row.contactCount}
                </span>
                <span className="w-10 flex-shrink-0 text-right text-sm font-semibold text-ink-800">{row.rate}%</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
        <h2 className="mb-4 text-sm font-semibold text-ink-800">Выручка по месяцам</h2>
        {monthRows.length === 0 ? (
          <p className="text-sm text-ink-400">Пока нет данных</p>
        ) : (
          <div className="flex h-40 items-end gap-3">
            {monthRows.map(([key, value]) => {
              const [year, month] = key.split("-");
              const heightPct = Math.max(4, Math.round((value / maxMonthValue) * 100));
              return (
                <div key={key} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[11px] font-medium text-ink-600">{formatMoney(value)}</span>
                  <div className="flex h-28 w-full items-end">
                    <div
                      className="w-full rounded-t bg-brand-500 transition-all"
                      style={{ height: `${heightPct}%` }}
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

      <section className="rounded-xl border border-ink-200 bg-white shadow-card">
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
                  <tr key={i} className="cursor-pointer border-b border-ink-100 last:border-0 hover:bg-ink-50">
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
    </div>
  );
}

function MoneyStat({
  label,
  value,
  count,
  tone,
  href,
}: {
  label: string;
  value: number;
  count?: number;
  tone: "brand" | PaymentStatus;
  href?: string;
}) {
  const colors =
    tone === "brand"
      ? { bg: "bg-brand-100", text: "text-brand-700" }
      : { bg: statusToneClasses[tone].bg, text: statusToneClasses[tone].text };
  const content = (
    <>
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${colors.bg} ${colors.text}`}>
        <CoinsIcon className="h-[18px] w-[18px]" />
      </div>
      <div className="text-xl font-semibold text-ink-900">{formatMoney(value)}</div>
      <div className="text-xs text-ink-500">
        {label}
        {count !== undefined ? ` · ${count}` : ""}
      </div>
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

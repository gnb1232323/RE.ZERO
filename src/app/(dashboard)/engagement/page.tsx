import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { computeEngagement } from "@/lib/engagement";
import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";

const riskColors: Record<string, string> = {
  LOW: "bg-lime-100 text-lime-700",
  MEDIUM: "bg-khaki-100 text-khaki-600",
  HIGH: "bg-danger-100 text-danger-600",
};
const riskLabels: Record<string, string> = { LOW: "Низкий", MEDIUM: "Средний", HIGH: "Высокий" };

export default async function EngagementPage() {
  const user = await getCurrentUser();
  if (!["OWNER", "SALES", "TEACHER"].includes(user.role)) {
    redirect("/");
  }

  const contactFilter: Prisma.ContactWhereInput =
    user.role === "OWNER" ? {} : { OR: [{ ownerId: user.id }, { teacherId: user.id }] };

  const students = await prisma.student.findMany({
    where: { contact: { deletedAt: null, ...contactFilter } },
    select: { id: true, contact: { select: { id: true, fullName: true } } },
  });

  const rows = (
    await Promise.all(
      students.map(async (s) => ({ student: s, stats: await computeEngagement(s.id) }))
    )
  )
    .filter((r) => r.stats.risk !== null)
    .sort((a, b) => (a.stats.coefficient ?? 0) - (b.stats.coefficient ?? 0));

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Прогноз вовлечённости</h1>
        <p className="mt-0.5 text-sm text-ink-500">Посещения (%) · Средняя оценка · Коэффициент вовлечённости</p>
      </div>

      <section className="card-hover rounded-2xl border border-ink-200 bg-white shadow-card">
        {rows.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-400">Пока недостаточно данных (нужны проведённые и оценённые уроки).</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-200 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
                <tr>
                  <th className="px-5 py-3">Ученик</th>
                  <th className="px-5 py-3">Посещения</th>
                  <th className="px-5 py-3">Средняя оценка</th>
                  <th className="px-5 py-3">Коэффициент</th>
                  <th className="px-5 py-3">Риск</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ student, stats }) => (
                  <tr key={student.id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50">
                    <td className="p-0">
                      <Link href={`/contacts/${student.contact.id}`} className="block px-5 py-2.5 font-medium text-ink-800 hover:text-brand-700">
                        {student.contact.fullName}
                      </Link>
                    </td>
                    <td className="px-5 py-2.5 text-ink-600">{Math.round(stats.attendancePct)}%</td>
                    <td className="px-5 py-2.5 text-ink-600">{stats.avgEngagement?.toFixed(1)}</td>
                    <td className="px-5 py-2.5 font-medium text-ink-800">{stats.coefficient?.toFixed(1)}</td>
                    <td className="px-5 py-2.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${riskColors[stats.risk!]}`}>
                        {riskLabels[stats.risk!]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

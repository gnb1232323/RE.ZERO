import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { formatMoney } from "@/lib/money";
import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";

export default async function DebtPage() {
  const user = await getCurrentUser();
  if (!["OWNER", "SALES", "TEACHER"].includes(user.role)) {
    redirect("/");
  }

  const contactFilter: Prisma.ContactWhereInput =
    user.role === "OWNER" ? {} : { OR: [{ ownerId: user.id }, { teacherId: user.id }] };

  const students = await prisma.student.findMany({
    where: {
      contact: { deletedAt: null, ...contactFilter },
      pricePerLesson: { not: null },
    },
    select: {
      id: true,
      pricePerLesson: true,
      lessonBalance: true,
      contact: { select: { id: true, fullName: true } },
    },
  });

  const inDebt = students
    .filter((s) => Number(s.lessonBalance) < 0)
    .sort((a, b) => Number(a.lessonBalance) - Number(b.lessonBalance));
  const approaching = students.filter((s) => {
    const balance = Number(s.lessonBalance);
    const price = Number(s.pricePerLesson);
    return balance >= 0 && balance < price;
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Задолженность</h1>
        <p className="mt-0.5 text-sm text-ink-500">Кому пора напомнить об оплате</p>
      </div>

      <section className="card-hover rounded-2xl border border-danger-200 bg-white shadow-card">
        <h2 className="border-b border-ink-100 px-5 py-4 text-sm font-semibold text-danger-600">
          В минусе ({inDebt.length})
        </h2>
        {inDebt.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-400">Никто не в минусе.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {inDebt.map((s) => (
              <li key={s.id}>
                <Link href={`/contacts/${s.contact.id}`} className="transition-smooth flex items-center justify-between px-5 py-3 hover:bg-danger-100/30">
                  <span className="text-sm font-medium text-ink-800">{s.contact.fullName}</span>
                  <span className="text-sm font-semibold text-danger-600">{formatMoney(Number(s.lessonBalance))}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card-hover rounded-2xl border border-khaki-200 bg-white shadow-card">
        <h2 className="border-b border-ink-100 px-5 py-4 text-sm font-semibold text-khaki-600">
          Скоро закончится оплата ({approaching.length})
        </h2>
        {approaching.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-400">Пока ни у кого не заканчивается.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {approaching.map((s) => (
              <li key={s.id}>
                <Link href={`/contacts/${s.contact.id}`} className="transition-smooth flex items-center justify-between px-5 py-3 hover:bg-khaki-100/30">
                  <span className="text-sm font-medium text-ink-800">{s.contact.fullName}</span>
                  <span className="text-sm font-semibold text-khaki-600">{formatMoney(Number(s.lessonBalance))}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

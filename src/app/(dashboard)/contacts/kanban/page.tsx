import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "@/components/contacts/kanban-board";

export default async function KanbanPage() {
  const rows = await prisma.contact.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 300,
    select: { id: true, fullName: true, phone: true, stage: true, student: { select: { paymentAmount: true } } },
  });

  const contacts = rows.map((c) => ({
    ...c,
    paymentAmount: c.student ? Number(c.student.paymentAmount) : null,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Канбан</h1>
        <p className="mt-0.5 text-sm text-ink-500 md:hidden">Выберите стадию вкладкой сверху</p>
        <p className="mt-0.5 hidden text-sm text-ink-500 md:block">Перетащите карточку между колонками, чтобы сменить стадию</p>
      </div>
      <KanbanBoard contacts={contacts} />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "@/components/contacts/kanban-board";

export default async function KanbanPage() {
  const contacts = await prisma.contact.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 300,
    select: { id: true, fullName: true, phone: true, stage: true },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Канбан</h1>
        <p className="mt-0.5 text-sm text-ink-500">Перетащите карточку между колонками, чтобы сменить стадию</p>
      </div>
      <KanbanBoard contacts={contacts} />
    </div>
  );
}

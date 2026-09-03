import { prisma } from "@/lib/prisma";
import { TaskList } from "@/components/tasks/task-list";

export default async function TasksPage() {
  const [openTasks, doneTasks] = await Promise.all([
    prisma.task.findMany({
      where: { status: "OPEN" },
      include: { assignedTo: { select: { name: true } }, contact: { select: { id: true, fullName: true } } },
      orderBy: { dueAt: "asc" },
    }),
    prisma.task.findMany({
      where: { status: "DONE" },
      include: { assignedTo: { select: { name: true } }, contact: { select: { id: true, fullName: true } } },
      orderBy: { completedAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Задачи</h1>
        <p className="mt-0.5 text-sm text-ink-500">{openTasks.length} открытых</p>
      </div>
      <section className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
        <h2 className="mb-3 text-sm font-semibold text-ink-800">Открытые задачи</h2>
        <TaskList tasks={openTasks} />
      </section>
      <section className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
        <h2 className="mb-3 text-sm font-semibold text-ink-800">Недавно выполненные</h2>
        <TaskList tasks={doneTasks} />
      </section>
    </div>
  );
}

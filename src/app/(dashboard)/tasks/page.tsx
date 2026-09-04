import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { TaskList } from "@/components/tasks/task-list";

export default async function TasksPage() {
  await requireRole("OWNER", "SALES");

  const [openTasks, doneTasks, users] = await Promise.all([
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
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Задачи</h1>
        <p className="mt-0.5 text-sm text-ink-500">{openTasks.length} открытых</p>
      </div>
      <section className="card-hover rounded-2xl border border-ink-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-3.5 flex items-center gap-2 text-sm font-semibold text-ink-800">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-100 text-brand-700">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
          </span>
          Открытые задачи
        </h2>
        <TaskList tasks={openTasks} users={users} />
      </section>
      <section className="card-hover rounded-2xl border border-ink-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-3.5 flex items-center gap-2 text-sm font-semibold text-ink-800">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-lime-100 text-lime-700">
            <span className="h-2 w-2 rounded-full bg-lime-500" />
          </span>
          Недавно выполненные
        </h2>
        <TaskList tasks={doneTasks} users={users} />
      </section>
    </div>
  );
}

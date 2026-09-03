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
        <h1 className="mb-3 text-lg font-semibold text-brand-800">Открытые задачи</h1>
        <TaskList tasks={openTasks} />
      </div>
      <div>
        <h2 className="mb-3 text-sm font-medium text-khaki-700">Недавно выполненные</h2>
        <TaskList tasks={doneTasks} />
      </div>
    </div>
  );
}

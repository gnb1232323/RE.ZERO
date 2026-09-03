"use client";

import { useTransition } from "react";
import Link from "next/link";
import { completeTask } from "@/lib/actions/tasks";
import { formatDateAlmaty } from "@/lib/date";

type TaskRow = {
  id: string;
  title: string;
  dueAt: Date;
  status: "OPEN" | "DONE" | "CANCELLED";
  assignedTo: { name: string };
  contact?: { id: string; fullName: string };
};

export function TaskList({ tasks }: { tasks: TaskRow[] }) {
  const [isPending, startTransition] = useTransition();

  if (tasks.length === 0) {
    return <p className="text-sm text-khaki-400">Задач пока нет</p>;
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => {
        const isOverdue = task.status === "OPEN" && task.dueAt.getTime() < Date.now();
        return (
        <li
          key={task.id}
          className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${isOverdue ? "border-danger-500/40 bg-danger-100/40" : "border-khaki-200"}`}
        >
          <div>
            <span className={task.status === "DONE" ? "text-khaki-400 line-through" : "text-brand-800"}>
              {task.title}
            </span>
            <span className={`ml-2 ${isOverdue ? "font-medium text-danger-600" : "text-khaki-400"}`}>
              {task.assignedTo.name} · {formatDateAlmaty(task.dueAt)}
            </span>
            {task.contact && (
              <>
                {" · "}
                <Link href={`/contacts/${task.contact.id}`} className="text-khaki-400 hover:underline">
                  {task.contact.fullName}
                </Link>
              </>
            )}
          </div>
          {task.status === "OPEN" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => completeTask(task.id))}
              className="rounded-md border border-lime-300 px-2 py-1 text-xs font-medium text-lime-700 hover:bg-lime-100 disabled:opacity-50"
            >
              Выполнено
            </button>
          )}
        </li>
        );
      })}
    </ul>
  );
}

"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { completeTask, reopenTask, updateTask } from "@/lib/actions/tasks";
import { formatDateAlmaty } from "@/lib/date";

type TaskRow = {
  id: string;
  title: string;
  dueAt: Date;
  status: "OPEN" | "DONE" | "CANCELLED";
  assignedTo: { name: string } | null;
  assignedToId?: string | null;
  contact?: { id: string; fullName: string };
};

type UserOption = { id: string; name: string };

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function TaskList({ tasks, users = [] }: { tasks: TaskRow[]; users?: UserOption[] }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-ink-400">Задач пока нет</p>;
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} users={users} />
      ))}
    </ul>
  );
}

function TaskItem({ task, users }: { task: TaskRow; users: UserOption[] }) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [state, formAction, formPending] = useActionState(updateTask, undefined);
  const isOverdue = task.status === "OPEN" && task.dueAt.getTime() < Date.now();

  if (editing) {
    return (
      <li className="animate-fade-in rounded-md border border-brand-300 bg-brand-50 px-3 py-2.5 text-sm">
        <form
          action={(formData) => {
            formAction(formData);
            setEditing(false);
          }}
          className="flex flex-wrap items-end gap-2"
        >
          <input type="hidden" name="taskId" value={task.id} />
          <div>
            <label className="mb-1 block text-xs text-ink-500">Задача</label>
            <input
              name="title"
              required
              defaultValue={task.title}
              className="rounded-md border border-ink-300 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-500">Срок</label>
            <input
              name="dueAt"
              type="date"
              required
              defaultValue={toDateInputValue(task.dueAt)}
              className="rounded-md border border-ink-300 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-500">Ответственный</label>
            <select
              name="assignedToId"
              defaultValue={task.assignedToId ?? ""}
              className="rounded-md border border-ink-300 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
            >
              <option value="">Без ответственного</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={formPending}
            className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            Сохранить
          </button>
          <button type="button" onClick={() => setEditing(false)} className="text-xs text-ink-500 hover:underline">
            Отмена
          </button>
          {state?.message && <p className="w-full text-xs text-danger-600">{state.message}</p>}
        </form>
      </li>
    );
  }

  return (
    <li
      className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm ${isOverdue ? "border-danger-500/40 bg-danger-100/40" : "border-ink-200"}`}
    >
      <div>
        <span className={task.status === "DONE" ? "text-ink-400 line-through" : "text-brand-800"}>{task.title}</span>
        <span className={`ml-2 ${isOverdue ? "font-medium text-danger-600" : "text-ink-400"}`}>
          {task.assignedTo ? task.assignedTo.name : "Без ответственного"} · {formatDateAlmaty(task.dueAt)}
        </span>
        {task.contact && (
          <>
            {" · "}
            <Link href={`/contacts/${task.contact.id}`} className="text-ink-400 hover:underline">
              {task.contact.fullName}
            </Link>
          </>
        )}
      </div>
      <div className="flex flex-shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-md border border-ink-200 px-2 py-1 text-xs font-medium text-ink-600 hover:bg-ink-100"
        >
          Изменить
        </button>
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
        {task.status === "DONE" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => reopenTask(task.id))}
            className="rounded-md border border-khaki-400 px-2 py-1 text-xs font-medium text-khaki-600 hover:bg-khaki-100 disabled:opacity-50"
          >
            Вернуть в работу
          </button>
        )}
      </div>
    </li>
  );
}

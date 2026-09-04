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
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl bg-ink-50/60 py-8 text-center">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 text-ink-400">
          <svg viewBox="0 0 16 16" className="h-4 w-4">
            <rect x="3" y="3" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none" />
          </svg>
        </span>
        <p className="text-sm text-ink-400">Задач пока нет</p>
      </div>
    );
  }

  return (
    <ul className="space-y-1.5">
      {tasks.map((task, i) => (
        <TaskItem key={task.id} task={task} users={users} index={i} />
      ))}
    </ul>
  );
}

function TaskItem({ task, users, index }: { task: TaskRow; users: UserOption[]; index: number }) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [state, formAction, formPending] = useActionState(updateTask, undefined);
  const isOverdue = task.status === "OPEN" && task.dueAt.getTime() < Date.now();
  const isDone = task.status === "DONE";

  if (editing) {
    return (
      <li className="animate-fade-in-scale rounded-xl border border-brand-300 bg-brand-50 px-3.5 py-3 text-sm">
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
              className="rounded-lg border border-ink-300 bg-white px-2.5 py-1.5 text-sm outline-none transition-smooth focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-500">Срок</label>
            <input
              name="dueAt"
              type="date"
              required
              defaultValue={toDateInputValue(task.dueAt)}
              className="rounded-lg border border-ink-300 bg-white px-2.5 py-1.5 text-sm outline-none transition-smooth focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-500">Ответственный</label>
            <select
              name="assignedToId"
              defaultValue={task.assignedToId ?? ""}
              className="rounded-lg border border-ink-300 bg-white px-2.5 py-1.5 text-sm outline-none transition-smooth focus:border-brand-400"
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
            className="transition-smooth rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 active:scale-95 disabled:opacity-50"
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
      style={{ "--stagger-i": index } as React.CSSProperties}
      className={`stagger-item transition-smooth group flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm ${
        isOverdue ? "border-danger-200 bg-danger-100/30" : "border-ink-200 hover:border-ink-300 hover:bg-ink-50/60"
      }`}
    >
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => (isDone ? reopenTask(task.id) : completeTask(task.id)))}
        title={isDone ? "Вернуть в работу" : "Отметить выполненной"}
        className={`transition-smooth flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 disabled:opacity-50 ${
          isDone ? "border-lime-500 bg-lime-500 text-white" : "border-ink-300 hover:border-brand-400 hover:bg-brand-50"
        }`}
      >
        {isDone && (
          <svg viewBox="0 0 12 12" className="h-3 w-3">
            <path d="M2.5 6l2.5 2.5L9.5 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <span className={isDone ? "text-ink-400 line-through" : "text-ink-800"}>{task.title}</span>
        <span className={`ml-2 ${isOverdue ? "font-medium text-danger-600" : "text-ink-400"}`}>
          {task.assignedTo ? task.assignedTo.name : "Без ответственного"} · {formatDateAlmaty(task.dueAt)}
        </span>
        {task.contact && (
          <>
            {" · "}
            <Link href={`/contacts/${task.contact.id}`} className="text-ink-400 hover:text-brand-700 hover:underline">
              {task.contact.fullName}
            </Link>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => setEditing(true)}
        className="transition-smooth flex-shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-ink-400 opacity-0 group-hover:opacity-100 hover:bg-ink-100 hover:text-ink-700"
      >
        Изменить
      </button>
    </li>
  );
}

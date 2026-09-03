"use client";

import { useActionState } from "react";
import { createTask } from "@/lib/actions/tasks";

export function TaskForm({ contactId, users }: { contactId: string; users: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(createTask, undefined);

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="contactId" value={contactId} />
      <div>
        <label className="mb-1 block text-xs text-khaki-500">Задача</label>
        <input
          name="title"
          required
          className="rounded-md border border-khaki-300 px-2 py-1.5 text-sm"
          placeholder="Например, позвонить"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-khaki-500">Срок</label>
        <input name="dueAt" type="date" required className="rounded-md border border-khaki-300 px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-khaki-500">Ответственный</label>
        <select name="assignedToId" required defaultValue="" className="rounded-md border border-khaki-300 px-2 py-1.5 text-sm">
          <option value="" disabled>
            Выбрать
          </option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {pending ? "..." : "Добавить"}
      </button>
      {state?.message && <p className="w-full text-sm text-danger-600">{state.message}</p>}
    </form>
  );
}

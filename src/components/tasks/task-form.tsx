"use client";

import { useActionState } from "react";
import { createTask } from "@/lib/actions/tasks";
import { PlusIcon } from "@/components/icons";

const inputClasses =
  "rounded-lg border border-ink-300 bg-ink-50/60 px-2.5 py-1.5 text-sm outline-none transition-smooth focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100";

export function TaskForm({ contactId, users }: { contactId: string; users: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(createTask, undefined);

  return (
    <form action={action} className="flex flex-wrap items-end gap-2 border-b border-ink-100 pb-4">
      <input type="hidden" name="contactId" value={contactId} />
      <div>
        <label className="mb-1 block text-xs text-ink-500">Задача</label>
        <input name="title" required className={inputClasses} placeholder="Например, позвонить" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-500">Срок</label>
        <input name="dueAt" type="date" required className={inputClasses} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-500">Ответственный</label>
        <select name="assignedToId" required defaultValue="" className={inputClasses}>
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
        className="transition-smooth flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700 hover:shadow-pop active:scale-[0.98] disabled:opacity-50"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        {pending ? "..." : "Добавить"}
      </button>
      {state?.message && <p className="w-full text-sm text-danger-600">{state.message}</p>}
    </form>
  );
}

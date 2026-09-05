"use client";

import { useActionState, useTransition } from "react";
import { createUser, updateUserRole, deleteUser } from "@/lib/actions/users";
import type { UserRole } from "@/generated/prisma/enums";

const roleLabels: Record<UserRole, string> = {
  OWNER: "Владелец",
  SALES: "Отдел продаж",
  MARKETING: "Отдел маркетинга",
  TEACHER: "Учитель",
};

const inputClasses =
  "w-full rounded-lg border border-ink-300 bg-ink-50/60 px-3 py-2 text-sm outline-none transition-smooth focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100";

type UserRow = { id: string; name: string; email: string; role: UserRole };

export function UserManagement({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const [state, action, pending] = useActionState(createUser, undefined);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <div className="card-hover rounded-2xl border border-ink-200 bg-white shadow-card">
        <h2 className="border-b border-ink-100 px-5 py-4 text-sm font-semibold text-ink-800 sm:px-6">Сотрудники</h2>
        <ul className="divide-y divide-ink-100">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-800">{u.name}</p>
                <p className="truncate text-xs text-ink-400">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  defaultValue={u.role}
                  disabled={u.id === currentUserId || isPending}
                  onChange={(e) => startTransition(() => updateUserRole(u.id, e.target.value as UserRole))}
                  className="rounded-md border border-ink-300 bg-white px-2 py-1.5 text-xs outline-none transition-smooth focus:border-brand-400 disabled:opacity-50"
                >
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {u.id !== currentUserId && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      if (confirm(`Удалить доступ для ${u.name}?`)) {
                        startTransition(() => deleteUser(u.id));
                      }
                    }}
                    className="transition-smooth rounded-md px-2 py-1.5 text-xs font-medium text-danger-600 hover:bg-danger-100 disabled:opacity-50"
                  >
                    Удалить
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <form action={action} className="card-hover space-y-4 rounded-2xl border border-ink-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="text-sm font-semibold text-ink-800">Добавить сотрудника</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[13px] font-medium text-ink-700">Имя</label>
            <input name="name" required className={inputClasses} />
            {state?.errors?.name && <p className="mt-1 text-xs text-danger-600">{state.errors.name[0]}</p>}
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium text-ink-700">Роль</label>
            <select name="role" defaultValue="TEACHER" className={inputClasses}>
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium text-ink-700">Email (логин)</label>
            <input name="email" type="email" required className={inputClasses} />
            {state?.errors?.email && <p className="mt-1 text-xs text-danger-600">{state.errors.email[0]}</p>}
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium text-ink-700">Пароль</label>
            <input name="password" type="text" required minLength={8} className={inputClasses} />
            {state?.errors?.password && <p className="mt-1 text-xs text-danger-600">{state.errors.password[0]}</p>}
          </div>
        </div>

        {state?.message && (
          <p
            className={`animate-fade-in rounded-lg px-3 py-2 text-sm font-medium ${
              state.success ? "bg-lime-100 text-lime-700" : "bg-danger-100 text-danger-600"
            }`}
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="transition-smooth rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 hover:shadow-pop active:scale-[0.98] disabled:opacity-50"
        >
          {pending ? "Создание..." : "Создать сотрудника"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { changePassword } from "@/lib/actions/auth";

const inputClasses =
  "w-full rounded-md border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export default function SettingsPage() {
  const [state, action, pending] = useActionState(changePassword, undefined);

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold text-ink-900">Настройки</h1>

      <form action={action} className="space-y-4 rounded-xl border border-ink-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-semibold text-ink-800">Смена пароля</h2>

        <div>
          <label className="mb-1 block text-sm text-ink-700">Текущий пароль</label>
          <input type="password" name="currentPassword" required className={inputClasses} />
          {state?.errors?.currentPassword && (
            <p className="mt-1 text-sm text-danger-600">{state.errors.currentPassword[0]}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm text-ink-700">Новый пароль</label>
          <input type="password" name="newPassword" required className={inputClasses} />
          {state?.errors?.newPassword && <p className="mt-1 text-sm text-danger-600">{state.errors.newPassword[0]}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm text-ink-700">Повторите новый пароль</label>
          <input type="password" name="confirmPassword" required className={inputClasses} />
          {state?.errors?.confirmPassword && (
            <p className="mt-1 text-sm text-danger-600">{state.errors.confirmPassword[0]}</p>
          )}
        </div>

        {state?.message && (
          <p className={state.success ? "text-sm text-lime-700" : "text-sm text-danger-600"}>{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {pending ? "Сохранение..." : "Изменить пароль"}
        </button>
      </form>
    </div>
  );
}

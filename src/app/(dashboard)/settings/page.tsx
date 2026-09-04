"use client";

import { useActionState } from "react";
import { changePassword } from "@/lib/actions/auth";

const inputClasses =
  "w-full rounded-lg border border-ink-300 bg-ink-50/60 px-3 py-2 text-sm outline-none transition-smooth focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100";

export default function SettingsPage() {
  const [state, action, pending] = useActionState(changePassword, undefined);

  return (
    <div className="animate-fade-in max-w-md space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Настройки</h1>

      <form action={action} className="card-hover space-y-4 rounded-2xl border border-ink-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="text-sm font-semibold text-ink-800">Смена пароля</h2>

        <div>
          <label className="mb-1 block text-[13px] font-medium text-ink-700">Текущий пароль</label>
          <input type="password" name="currentPassword" required className={inputClasses} />
          {state?.errors?.currentPassword && (
            <p className="mt-1 text-sm text-danger-600">{state.errors.currentPassword[0]}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-[13px] font-medium text-ink-700">Новый пароль</label>
          <input type="password" name="newPassword" required className={inputClasses} />
          {state?.errors?.newPassword && <p className="mt-1 text-sm text-danger-600">{state.errors.newPassword[0]}</p>}
        </div>

        <div>
          <label className="mb-1 block text-[13px] font-medium text-ink-700">Повторите новый пароль</label>
          <input type="password" name="confirmPassword" required className={inputClasses} />
          {state?.errors?.confirmPassword && (
            <p className="mt-1 text-sm text-danger-600">{state.errors.confirmPassword[0]}</p>
          )}
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
          {pending ? "Сохранение..." : "Изменить пароль"}
        </button>
      </form>
    </div>
  );
}

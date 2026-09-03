"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-700 via-brand-600 to-lime-600 px-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white p-8 shadow-xl shadow-brand-900/20">
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-lime-500" />
            <h1 className="text-xl font-semibold text-brand-800">RE ZERO CRM</h1>
          </div>
          <p className="text-sm text-ink-600">Войдите, чтобы продолжить</p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            {state?.errors?.email && (
              <p className="mt-1 text-sm text-danger-600">{state.errors.email[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink-700">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            {state?.errors?.password && (
              <p className="mt-1 text-sm text-danger-600">{state.errors.password[0]}</p>
            )}
          </div>

          {state?.message && <p className="text-sm text-danger-600">{state.message}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50"
          >
            {pending ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}

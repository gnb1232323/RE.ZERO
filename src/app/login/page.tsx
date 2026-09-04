"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-50 px-4">
      <div className="bg-dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--color-brand-300), transparent)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-[15%] h-[280px] w-[280px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--color-lime-300), transparent)" }}
      />

      <div className="animate-fade-in-scale relative w-full max-w-[380px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-800 shadow-pop">
            <span className="h-2.5 w-2.5 rounded-full bg-lime-400" />
          </span>
          <h1 className="text-[22px] font-semibold tracking-tight text-ink-900">RE ZERO CRM</h1>
          <p className="mt-1 text-sm text-ink-500">Войдите, чтобы продолжить</p>
        </div>

        <div className="rounded-2xl border border-ink-200/70 bg-white/90 p-7 shadow-modal backdrop-blur-sm">
          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-ink-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-ink-200 bg-ink-50/60 px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-smooth placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
              />
              {state?.errors?.email && <p className="mt-1.5 text-xs text-danger-600">{state.errors.email[0]}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-ink-700">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-ink-200 bg-ink-50/60 px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-smooth placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
              />
              {state?.errors?.password && <p className="mt-1.5 text-xs text-danger-600">{state.errors.password[0]}</p>}
            </div>

            {state?.message && (
              <p className="animate-fade-in rounded-lg bg-danger-100 px-3 py-2 text-xs font-medium text-danger-600">
                {state.message}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="group relative flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-smooth hover:bg-brand-700 hover:shadow-pop active:scale-[0.98] disabled:opacity-50"
            >
              {pending ? "Вход..." : "Войти"}
              {!pending && (
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

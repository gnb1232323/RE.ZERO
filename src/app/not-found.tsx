import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-50 px-4">
      <div className="bg-dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--color-brand-300), transparent)" }}
      />

      <div className="animate-fade-in-scale relative w-full max-w-sm text-center">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-800 shadow-pop">
          <span className="h-3 w-3 rounded-full bg-lime-400" />
        </span>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">Страница не найдена</h1>
        <p className="mt-2 text-sm text-ink-500">
          Такой страницы нет — возможно, контакт был удалён или ссылка устарела.
        </p>
        <Link
          href="/"
          className="transition-smooth mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 hover:shadow-pop active:scale-[0.98]"
        >
          На дашборд
        </Link>
      </div>
    </div>
  );
}

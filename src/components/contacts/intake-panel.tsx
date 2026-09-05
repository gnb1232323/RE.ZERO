"use client";

import { useActionState, useState } from "react";
import { upsertIntake } from "@/lib/actions/intake";
import type { IntakeProfile } from "@/generated/prisma/client";

const fieldInputClasses =
  "w-full rounded-lg border border-ink-300 bg-ink-50/60 px-2.5 py-1.5 text-sm outline-none transition-smooth focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100";
const fieldLabelClasses = "mb-1 block text-xs font-medium text-ink-500";

const FIELDS: { key: keyof IntakeProfile & string; label: string; placeholder?: string }[] = [
  { key: "occupation", label: "Работа / учёба" },
  { key: "goal", label: "Цель обучения" },
  { key: "interests", label: "Интересы" },
  { key: "painPoint", label: "Почему не выучил раньше", placeholder: "Что мешало в прошлый раз" },
  { key: "fears", label: "Страхи / возражения", placeholder: "Почему боится начинать" },
  { key: "notes", label: "Другое", placeholder: "Всё остальное важное" },
];

export function IntakePanel({ contactId, intake, readOnly = false }: { contactId: string; intake: IntakeProfile | null; readOnly?: boolean }) {
  const [state, action, pending] = useActionState(upsertIntake, undefined);
  const [showForm, setShowForm] = useState(!intake && !readOnly);

  const hasAnyData = intake && FIELDS.some((f) => intake[f.key]);

  if (readOnly || !showForm) {
    return (
      <div className="animate-fade-in space-y-2 text-sm">
        {!hasAnyData ? (
          <p className="text-ink-400">Анкета ещё не заполнена.</p>
        ) : (
          <div className="divide-y divide-ink-100 rounded-xl border border-ink-100 bg-ink-50/50 px-3">
            {FIELDS.map(
              (f) =>
                intake?.[f.key] && (
                  <div key={f.key} className="py-1.5">
                    <p className="text-xs text-ink-400">{f.label}</p>
                    <p className="text-ink-700">{String(intake[f.key])}</p>
                  </div>
                )
            )}
          </div>
        )}
        {!readOnly && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="transition-smooth rounded-md px-2 py-1 text-xs text-ink-500 hover:bg-ink-100 hover:text-ink-800"
          >
            {hasAnyData ? "Редактировать" : "Заполнить анкету"}
          </button>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="animate-fade-in space-y-3">
      <input type="hidden" name="contactId" value={contactId} />
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key} className={f.key === "notes" ? "sm:col-span-2" : ""}>
            <label className={fieldLabelClasses}>{f.label}</label>
            <textarea
              name={f.key}
              rows={2}
              defaultValue={intake?.[f.key] ? String(intake[f.key]) : ""}
              placeholder={f.placeholder}
              className={fieldInputClasses}
            />
          </div>
        ))}
      </div>

      {state?.message && <p className="text-sm text-danger-600">{state.message}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="transition-smooth rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700 hover:shadow-pop active:scale-[0.98] disabled:opacity-50"
        >
          {pending ? "Сохранение..." : "Сохранить"}
        </button>
        {hasAnyData && (
          <button type="button" onClick={() => setShowForm(false)} className="text-sm text-ink-500 hover:underline">
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}

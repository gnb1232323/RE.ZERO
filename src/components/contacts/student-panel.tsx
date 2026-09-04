"use client";

import { useActionState } from "react";
import { useState } from "react";
import { upsertStudent } from "@/lib/actions/students";
import { paymentStatusLabels } from "@/lib/labels";
import { formatMoney } from "@/lib/money";
import type { PaymentStatus, Receipt, Student } from "@/generated/prisma/client";

export type SerializedReceipt = Omit<Receipt, "paymentAmount"> & { paymentAmount: string };
export type SerializedStudent = Omit<Student, "paymentAmount"> & {
  paymentAmount: string;
  receipts?: SerializedReceipt[];
};

const paymentStatusColors: Record<PaymentStatus, { bg: string; text: string; dot: string }> = {
  UNPAID: { bg: "bg-danger-100", text: "text-danger-600", dot: "bg-danger-500" },
  PARTIAL: { bg: "bg-khaki-100", text: "text-khaki-600", dot: "bg-khaki-400" },
  PAID: { bg: "bg-lime-100", text: "text-lime-700", dot: "bg-lime-500" },
};

const fieldInputClasses =
  "w-full rounded-lg border border-ink-300 bg-ink-50/60 px-2.5 py-1.5 text-sm outline-none transition-smooth focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100";
const fieldLabelClasses = "mb-1 block text-xs font-medium text-ink-500";

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-xs text-ink-400">{label}</span>
      <span className="truncate text-right text-ink-700">{value}</span>
    </div>
  );
}

export function StudentPanel({ contactId, student }: { contactId: string; student: SerializedStudent | null }) {
  const [state, action, pending] = useActionState(upsertStudent, undefined);
  const [showForm, setShowForm] = useState(!student);

  if (!showForm && student) {
    const statusColors = paymentStatusColors[student.paymentStatus];
    return (
      <div className="animate-fade-in space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusColors.dot}`} />
            {paymentStatusLabels[student.paymentStatus]} · {formatMoney(student.paymentAmount)}
          </span>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="transition-smooth rounded-md px-2 py-1 text-xs text-ink-500 hover:bg-ink-100 hover:text-ink-800"
          >
            Редактировать
          </button>
        </div>

        <div className="divide-y divide-ink-100 rounded-xl border border-ink-100 bg-ink-50/50 px-3">
          <InfoRow label="Начало курса" value={toDateInputValue(student.courseStartDate) || "—"} />
          {student.targetLevel && <InfoRow label="Целевой уровень" value={student.targetLevel} />}
          {student.currentLevel && <InfoRow label="Текущий уровень" value={student.currentLevel} />}
        </div>

        {student.progressNotes && (
          <p className="rounded-xl border border-ink-100 bg-ink-50/50 px-3 py-2.5 text-ink-600">{student.progressNotes}</p>
        )}

        {student.receipts && student.receipts.length > 0 && (
          <div className="space-y-1 border-t border-ink-100 pt-3">
            <p className="mb-1.5 text-xs font-medium text-ink-500">Чеки</p>
            {student.receipts.map((receipt) => (
              <a
                key={receipt.id}
                href={receipt.driveViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-smooth flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-xs text-ink-600 hover:bg-ink-100 hover:text-brand-700"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-ink-100 text-ink-500">
                  <svg viewBox="0 0 14 14" className="h-3.5 w-3.5">
                    <path d="M3 1.5h5l3 3v8a1 1 0 01-1 1H3a1 1 0 01-1-1v-10a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {formatMoney(receipt.paymentAmount)} · {paymentStatusLabels[receipt.paymentStatus]}
                </span>
                <span className="flex-shrink-0 text-ink-400">
                  {new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
                    new Date(receipt.createdAt)
                  )}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="animate-fade-in space-y-3">
      <input type="hidden" name="contactId" value={contactId} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={fieldLabelClasses}>Начало курса</label>
          <input
            type="date"
            name="courseStartDate"
            required
            defaultValue={toDateInputValue(student?.courseStartDate)}
            className={fieldInputClasses}
          />
        </div>
        <div>
          <label className={fieldLabelClasses}>Целевой уровень</label>
          <input name="targetLevel" defaultValue={student?.targetLevel ?? ""} placeholder="Например, B2" className={fieldInputClasses} />
        </div>
        <div>
          <label className={fieldLabelClasses}>Целевая дата</label>
          <input type="date" name="targetDate" defaultValue={toDateInputValue(student?.targetDate)} className={fieldInputClasses} />
        </div>
        <div>
          <label className={fieldLabelClasses}>Текущий уровень</label>
          <input name="currentLevel" defaultValue={student?.currentLevel ?? ""} className={fieldInputClasses} />
        </div>
      </div>

      <div>
        <label className={fieldLabelClasses}>Заметки о прогрессе</label>
        <textarea
          name="progressNotes"
          rows={2}
          defaultValue={student?.progressNotes ?? ""}
          placeholder="Что уже получается, что видит ученик как свой прогресс"
          className={fieldInputClasses}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={fieldLabelClasses}>Сумма оплаты</label>
          <input
            name="paymentAmount"
            type="number"
            step="0.01"
            required
            defaultValue={student?.paymentAmount ?? ""}
            className={fieldInputClasses}
          />
        </div>
        <div>
          <label className={fieldLabelClasses}>Статус оплаты</label>
          <select name="paymentStatus" defaultValue={student?.paymentStatus ?? "UNPAID"} className={fieldInputClasses}>
            {Object.entries(paymentStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={fieldLabelClasses}>Чек оплаты (фото или PDF)</label>
        <input
          name="receipt"
          type="file"
          accept="image/*,.pdf"
          className="transition-smooth w-full rounded-lg border border-ink-300 bg-ink-50/60 px-2.5 py-1.5 text-sm file:mr-2 file:rounded-md file:border-0 file:bg-ink-200 file:px-2 file:py-1 file:text-xs file:font-medium file:text-ink-700 hover:file:bg-ink-300"
        />
        <p className="mt-1 text-xs text-ink-400">
          Если это новая оплата (изменился статус или сумма) — прикрепите чек, он сохранится на Google Диске.
        </p>
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
        {student && (
          <button type="button" onClick={() => setShowForm(false)} className="text-sm text-ink-500 hover:underline">
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}

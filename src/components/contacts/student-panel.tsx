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

const paymentStatusColors: Record<PaymentStatus, string> = {
  UNPAID: "bg-danger-100 text-danger-600",
  PARTIAL: "bg-ink-200 text-ink-700",
  PAID: "bg-lime-100 text-lime-700",
};

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function StudentPanel({ contactId, student }: { contactId: string; student: SerializedStudent | null }) {
  const [state, action, pending] = useActionState(upsertStudent, undefined);
  const [showForm, setShowForm] = useState(!student);

  if (!showForm && student) {
    return (
      <div className="animate-fade-in space-y-1.5 text-sm">
        <div className="flex items-center justify-end">
          <button type="button" onClick={() => setShowForm(true)} className="text-xs text-ink-500 transition hover:underline">
            Редактировать
          </button>
        </div>
        <p>Начало курса: {toDateInputValue(student.courseStartDate)}</p>
        {student.targetLevel && <p>Целевой уровень: {student.targetLevel}</p>}
        {student.currentLevel && <p>Текущий уровень: {student.currentLevel}</p>}
        {student.progressNotes && <p>Прогресс: {student.progressNotes}</p>}
        <p className="flex items-center gap-2">
          Оплата: {formatMoney(student.paymentAmount)}
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${paymentStatusColors[student.paymentStatus]}`}>
            {paymentStatusLabels[student.paymentStatus]}
          </span>
        </p>

        {student.receipts && student.receipts.length > 0 && (
          <div className="mt-2 space-y-1 border-t border-ink-100 pt-2">
            <p className="text-xs font-medium text-ink-500">Чеки</p>
            {student.receipts.map((receipt) => (
              <a
                key={receipt.id}
                href={receipt.driveViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 rounded-md px-1.5 py-1 text-xs text-ink-600 transition hover:bg-ink-50 hover:text-brand-700"
              >
                <span className="truncate">
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
          <label className="mb-1 block text-xs text-ink-500">Начало курса</label>
          <input
            type="date"
            name="courseStartDate"
            required
            defaultValue={toDateInputValue(student?.courseStartDate)}
            className="w-full rounded-md border border-ink-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-500">Целевой уровень</label>
          <input
            name="targetLevel"
            defaultValue={student?.targetLevel ?? ""}
            placeholder="Например, B2"
            className="w-full rounded-md border border-ink-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-500">Целевая дата</label>
          <input
            type="date"
            name="targetDate"
            defaultValue={toDateInputValue(student?.targetDate)}
            className="w-full rounded-md border border-ink-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-500">Текущий уровень</label>
          <input
            name="currentLevel"
            defaultValue={student?.currentLevel ?? ""}
            className="w-full rounded-md border border-ink-300 px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-ink-500">Заметки о прогрессе</label>
        <textarea
          name="progressNotes"
          rows={2}
          defaultValue={student?.progressNotes ?? ""}
          placeholder="Что уже получается, что видит ученик как свой прогресс"
          className="w-full rounded-md border border-ink-300 px-2 py-1.5 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-ink-500">Сумма оплаты</label>
          <input
            name="paymentAmount"
            type="number"
            step="0.01"
            required
            defaultValue={student?.paymentAmount ?? ""}
            className="w-full rounded-md border border-ink-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-500">Статус оплаты</label>
          <select
            name="paymentStatus"
            defaultValue={student?.paymentStatus ?? "UNPAID"}
            className="w-full rounded-md border border-ink-300 px-2 py-1.5 text-sm"
          >
            {Object.entries(paymentStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-ink-500">Чек оплаты (фото или PDF)</label>
        <input
          name="receipt"
          type="file"
          accept="image/*,.pdf"
          className="w-full rounded-md border border-ink-300 bg-white px-2 py-1.5 text-sm file:mr-2 file:rounded file:border-0 file:bg-ink-100 file:px-2 file:py-1 file:text-xs file:font-medium file:text-ink-700"
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
          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm text-white transition hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50"
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

"use client";

import { useActionState } from "react";
import { useState } from "react";
import { upsertStudent } from "@/lib/actions/students";
import { paymentStatusLabels } from "@/lib/labels";
import type { PaymentStatus, Student } from "@/generated/prisma/client";

export type SerializedStudent = Omit<Student, "paymentAmount"> & { paymentAmount: string };

const paymentStatusColors: Record<PaymentStatus, string> = {
  UNPAID: "bg-danger-100 text-danger-600",
  PARTIAL: "bg-khaki-200 text-khaki-700",
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
      <div className="space-y-2 rounded-lg border border-khaki-200 bg-white p-4 text-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-brand-800">Студент</h3>
          <button type="button" onClick={() => setShowForm(true)} className="text-xs text-khaki-500 hover:underline">
            Редактировать
          </button>
        </div>
        <p>Начало курса: {toDateInputValue(student.courseStartDate)}</p>
        {student.targetLevel && <p>Целевой уровень: {student.targetLevel}</p>}
        {student.currentLevel && <p>Текущий уровень: {student.currentLevel}</p>}
        {student.progressNotes && <p>Прогресс: {student.progressNotes}</p>}
        <p className="flex items-center gap-2">
          Оплата: {student.paymentAmount} ₸
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${paymentStatusColors[student.paymentStatus]}`}>
            {paymentStatusLabels[student.paymentStatus]}
          </span>
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3 rounded-lg border border-khaki-200 bg-white p-4">
      <h3 className="text-sm font-medium text-brand-800">Данные студента</h3>
      <input type="hidden" name="contactId" value={contactId} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-khaki-500">Начало курса</label>
          <input
            type="date"
            name="courseStartDate"
            required
            defaultValue={toDateInputValue(student?.courseStartDate)}
            className="w-full rounded-md border border-khaki-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-khaki-500">Целевой уровень</label>
          <input
            name="targetLevel"
            defaultValue={student?.targetLevel ?? ""}
            placeholder="Например, B2"
            className="w-full rounded-md border border-khaki-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-khaki-500">Целевая дата</label>
          <input
            type="date"
            name="targetDate"
            defaultValue={toDateInputValue(student?.targetDate)}
            className="w-full rounded-md border border-khaki-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-khaki-500">Текущий уровень</label>
          <input
            name="currentLevel"
            defaultValue={student?.currentLevel ?? ""}
            className="w-full rounded-md border border-khaki-300 px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-khaki-500">Заметки о прогрессе</label>
        <textarea
          name="progressNotes"
          rows={2}
          defaultValue={student?.progressNotes ?? ""}
          placeholder="Что уже получается, что видит ученик как свой прогресс"
          className="w-full rounded-md border border-khaki-300 px-2 py-1.5 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-khaki-500">Сумма оплаты</label>
          <input
            name="paymentAmount"
            type="number"
            step="0.01"
            required
            defaultValue={student?.paymentAmount ?? ""}
            className="w-full rounded-md border border-khaki-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-khaki-500">Статус оплаты</label>
          <select
            name="paymentStatus"
            defaultValue={student?.paymentStatus ?? "UNPAID"}
            className="w-full rounded-md border border-khaki-300 px-2 py-1.5 text-sm"
          >
            {Object.entries(paymentStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state?.message && <p className="text-sm text-danger-600">{state.message}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {pending ? "Сохранение..." : "Сохранить"}
        </button>
        {student && (
          <button type="button" onClick={() => setShowForm(false)} className="text-sm text-khaki-500 hover:underline">
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}

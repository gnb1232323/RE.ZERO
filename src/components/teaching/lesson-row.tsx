"use client";

import { useState, useTransition } from "react";
import { markLessonStatus, rateLesson } from "@/lib/actions/lessons";
import { formatDateAlmaty } from "@/lib/date";
import type { LessonStatus } from "@/generated/prisma/enums";

const statusLabels: Record<LessonStatus, string> = {
  SCHEDULED: "Запланирован",
  COMPLETED: "Проведён",
  CANCELLED: "Отменён",
  NO_SHOW: "Не пришёл",
  RESCHEDULED: "Перенесён",
};

const statusColors: Record<LessonStatus, string> = {
  SCHEDULED: "bg-ink-100 text-ink-500",
  COMPLETED: "bg-lime-100 text-lime-700",
  CANCELLED: "bg-ink-200 text-ink-600",
  NO_SHOW: "bg-danger-100 text-danger-600",
  RESCHEDULED: "bg-khaki-100 text-khaki-600",
};

type Lesson = {
  id: string;
  scheduledAt: string;
  status: LessonStatus;
  wasLate: boolean;
  lessonRating: number | null;
  engagementRating: number | null;
  notes: string | null;
};

export function LessonRow({ lesson }: { lesson: Lesson }) {
  const [isPending, startTransition] = useTransition();
  const [showRating, setShowRating] = useState(false);
  const isPast = new Date(lesson.scheduledAt) < new Date();

  return (
    <div className="rounded-xl border border-ink-200 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-ink-800">{formatDateAlmaty(new Date(lesson.scheduledAt))}</p>
          {lesson.wasLate && <span className="text-xs text-khaki-600">Опоздал</span>}
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[lesson.status]}`}>
          {statusLabels[lesson.status]}
        </span>
      </div>

      {lesson.status === "SCHEDULED" && isPast && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => markLessonStatus(lesson.id, "COMPLETED", false))}
            className="transition-smooth rounded-md border border-lime-300 px-2 py-1 text-xs font-medium text-lime-700 hover:bg-lime-100 disabled:opacity-50"
          >
            Проведён
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => markLessonStatus(lesson.id, "COMPLETED", true))}
            className="transition-smooth rounded-md border border-khaki-300 px-2 py-1 text-xs font-medium text-khaki-600 hover:bg-khaki-100 disabled:opacity-50"
          >
            Проведён (опоздал)
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => markLessonStatus(lesson.id, "NO_SHOW", false))}
            className="transition-smooth rounded-md border border-danger-300 px-2 py-1 text-xs font-medium text-danger-600 hover:bg-danger-100 disabled:opacity-50"
          >
            Не пришёл
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => markLessonStatus(lesson.id, "RESCHEDULED", false))}
            className="transition-smooth rounded-md border border-ink-300 px-2 py-1 text-xs font-medium text-ink-600 hover:bg-ink-100 disabled:opacity-50"
          >
            Перенесён
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => markLessonStatus(lesson.id, "CANCELLED", false))}
            className="transition-smooth rounded-md border border-ink-300 px-2 py-1 text-xs font-medium text-ink-600 hover:bg-ink-100 disabled:opacity-50"
          >
            Отменён
          </button>
        </div>
      )}

      {lesson.status === "COMPLETED" && (
        <div className="mt-2">
          {lesson.lessonRating != null ? (
            <p className="text-xs text-ink-500">
              Оценка урока: {lesson.lessonRating}/5 · Вовлечённость: {lesson.engagementRating}/5
              {lesson.notes && <span className="block text-ink-400">{lesson.notes}</span>}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setShowRating((v) => !v)}
              className="transition-smooth rounded-md px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
            >
              Оценить урок
            </button>
          )}

          {showRating && (
            <form
              action={(formData) => {
                startTransition(() =>
                  rateLesson(
                    lesson.id,
                    Number(formData.get("lessonRating")),
                    Number(formData.get("engagementRating")),
                    String(formData.get("notes") ?? "")
                  )
                );
                setShowRating(false);
              }}
              className="animate-fade-in mt-2 space-y-2 rounded-lg bg-ink-50/60 p-2.5"
            >
              <div className="flex gap-3">
                <label className="text-xs text-ink-500">
                  Оценка урока
                  <select name="lessonRating" defaultValue="5" className="ml-1.5 rounded border border-ink-300 px-1.5 py-0.5 text-xs">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-ink-500">
                  Вовлечённость
                  <select name="engagementRating" defaultValue="5" className="ml-1.5 rounded border border-ink-300 px-1.5 py-0.5 text-xs">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
              </div>
              <input name="notes" placeholder="Заметка (необязательно)" className="w-full rounded border border-ink-300 px-2 py-1 text-xs" />
              <button type="submit" className="transition-smooth rounded-md bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700">
                Сохранить
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

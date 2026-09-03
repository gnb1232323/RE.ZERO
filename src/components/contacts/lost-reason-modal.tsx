"use client";

import { useState } from "react";

export function LostReasonModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40" onClick={onCancel} />
      <div className="animate-fade-in-scale relative w-full max-w-sm rounded-xl bg-white p-5 shadow-pop">
        <h3 className="mb-1 text-sm font-semibold text-ink-900">Причина отказа</h3>
        <p className="mb-3 text-xs text-ink-500">Необязательно, но полезно для анализа позже — что чаще всего мешает.</p>
        <textarea
          autoFocus
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Например: нашёл дешевле, не подошло время, передумал..."
          className="mb-3 w-full rounded-md border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-3 py-1.5 text-sm text-ink-500 transition hover:bg-ink-100"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason.trim())}
            className="rounded-md bg-danger-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-danger-500 active:scale-[0.98]"
          >
            Перевести в «Отказ»
          </button>
        </div>
      </div>
    </div>
  );
}

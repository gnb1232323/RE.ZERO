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
      <div className="animate-fade-in absolute inset-0 bg-ink-900/50 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="animate-fade-in-scale relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-modal">
        <h3 className="mb-1 text-sm font-semibold text-ink-900">Причина отказа</h3>
        <p className="mb-3 text-xs text-ink-500">Необязательно, но полезно для анализа позже — что чаще всего мешает.</p>
        <textarea
          autoFocus
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Например: нашёл дешевле, не подошло время, передумал..."
          className="mb-3 w-full rounded-lg border border-ink-300 bg-ink-50/60 px-3 py-2 text-sm outline-none transition-smooth focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="transition-smooth rounded-lg px-3 py-1.5 text-sm text-ink-500 hover:bg-ink-100"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason.trim())}
            className="transition-smooth rounded-lg bg-danger-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-danger-500 hover:shadow-pop active:scale-[0.98]"
          >
            Перевести в «Отказ»
          </button>
        </div>
      </div>
    </div>
  );
}

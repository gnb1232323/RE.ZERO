"use client";

import { useTransition } from "react";
import { softDeleteContact } from "@/lib/actions/contacts";

export function DeleteContactButton({ contactId }: { contactId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (window.confirm("Удалить контакт? Это можно будет восстановить только вручную из базы данных.")) {
          startTransition(() => softDeleteContact(contactId));
        }
      }}
      className="transition-smooth flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-ink-400 hover:bg-danger-100 hover:text-danger-600 disabled:opacity-50"
    >
      <svg viewBox="0 0 14 14" className="h-3.5 w-3.5">
        <path d="M2.5 4h9M5.5 4V2.8a.8.8 0 01.8-.8h1.4a.8.8 0 01.8.8V4M4.5 4l.5 7.2a1 1 0 001 .8h2a1 1 0 001-1L9.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      Удалить
    </button>
  );
}

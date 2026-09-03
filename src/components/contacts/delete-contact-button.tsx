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
      className="text-sm text-ink-400 transition hover:text-danger-600 disabled:opacity-50"
    >
      Удалить
    </button>
  );
}

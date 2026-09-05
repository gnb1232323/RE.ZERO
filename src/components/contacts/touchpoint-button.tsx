"use client";

import { useTransition } from "react";
import { createTouchpointTask } from "@/lib/actions/touchpoints";

export function TouchpointButton({ contactId }: { contactId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => createTouchpointTask(contactId))}
      className="transition-smooth w-full rounded-lg border border-dashed border-brand-300 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
    >
      {isPending ? "Создаём..." : "+ Точка касания (напомнить о себе)"}
    </button>
  );
}

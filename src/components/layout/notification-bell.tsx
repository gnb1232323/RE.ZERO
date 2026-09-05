"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { BellIcon, CloseIcon } from "@/components/icons";
import { markNotificationRead } from "@/lib/actions/notifications";

type NotificationItem = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  createdAt: string;
};

export function NotificationBell({ initial, align = "right" }: { initial: NotificationItem[]; align?: "left" | "right" }) {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        setItems(data.notifications ?? []);
      } catch {
        // ignore transient network errors
      }
    };
    const id = setInterval(poll, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Уведомления"
        className="transition-smooth relative flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-800"
      >
        <BellIcon className="h-[18px] w-[18px]" />
        {items.length > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`animate-fade-in-scale absolute z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-ink-200 bg-white shadow-modal ${
              align === "left" ? "left-0" : "right-0"
            }`}
          >
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
              <p className="text-sm font-semibold text-ink-800">Уведомления</p>
              <button type="button" onClick={() => setOpen(false)} className="text-ink-400 hover:text-ink-700">
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-ink-400">Новых уведомлений нет</p>
              ) : (
                items.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link ?? "#"}
                    onClick={() => {
                      setItems((prev) => prev.filter((x) => x.id !== n.id));
                      startTransition(() => markNotificationRead(n.id));
                      setOpen(false);
                    }}
                    className="transition-smooth block border-b border-ink-50 px-4 py-3 last:border-0 hover:bg-ink-50"
                  >
                    <p className="text-sm font-medium text-ink-800">{n.title}</p>
                    {n.body && <p className="mt-0.5 text-xs text-ink-500">{n.body}</p>}
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

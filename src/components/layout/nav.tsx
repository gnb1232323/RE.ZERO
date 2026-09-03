"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";

const links = [
  { href: "/", label: "Дашборд" },
  { href: "/contacts", label: "Контакты" },
  { href: "/contacts/kanban", label: "Канбан" },
  { href: "/tasks", label: "Задачи" },
  { href: "/settings", label: "Настройки" },
];

function isLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/contacts") {
    return pathname === "/contacts" || (pathname.startsWith("/contacts/") && !pathname.startsWith("/contacts/kanban"));
  }
  return pathname.startsWith(href);
}

export function Nav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-khaki-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-brand-700">
            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-lime-500" />
            RE ZERO CRM
          </span>
          <nav className="hidden gap-1 md:flex">
            {links.map((link) => {
              const isActive = isLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    isActive
                      ? "rounded-md bg-brand-100 px-2.5 py-1.5 text-sm font-medium text-brand-700"
                      : "rounded-md px-2.5 py-1.5 text-sm text-khaki-700 transition hover:bg-brand-50 hover:text-brand-700"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <span className="text-sm text-khaki-600">{userName}</span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md px-2 py-1 text-sm text-khaki-500 transition hover:bg-danger-100 hover:text-danger-600"
            >
              Выйти
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Меню"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-brand-700 hover:bg-brand-50 md:hidden"
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-khaki-200 px-4 py-3 md:hidden">
          {links.map((link) => {
            const isActive = isLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={
                  isActive
                    ? "rounded-md bg-brand-100 px-3 py-2 text-sm font-medium text-brand-700"
                    : "rounded-md px-3 py-2 text-sm text-khaki-700 hover:bg-brand-50 hover:text-brand-700"
                }
              >
                {link.label}
              </Link>
            );
          })}
          <div className="mt-2 flex items-center justify-between border-t border-khaki-100 px-3 pt-3">
            <span className="text-sm text-khaki-600">{userName}</span>
            <form action={logout}>
              <button type="submit" className="text-sm text-khaki-500 hover:text-danger-600">
                Выйти
              </button>
            </form>
          </div>
        </nav>
      )}
    </header>
  );
}

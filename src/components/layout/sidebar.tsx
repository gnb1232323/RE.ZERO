"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import type { UserRole } from "@/generated/prisma/enums";
import {
  DashboardIcon,
  ContactsIcon,
  KanbanIcon,
  TasksIcon,
  FinanceIcon,
  SettingsIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
} from "@/components/icons";

const roleLabels: Record<UserRole, string> = {
  OWNER: "Владелец",
  SALES: "Отдел продаж",
  MARKETING: "Отдел маркетинга",
};

const links: { href: string; label: string; icon: typeof DashboardIcon; roles?: UserRole[] }[] = [
  { href: "/", label: "Дашборд", icon: DashboardIcon },
  { href: "/contacts", label: "Контакты", icon: ContactsIcon, roles: ["OWNER", "SALES"] },
  { href: "/contacts/kanban", label: "Канбан", icon: KanbanIcon, roles: ["OWNER", "SALES"] },
  { href: "/tasks", label: "Задачи", icon: TasksIcon, roles: ["OWNER", "SALES"] },
  { href: "/finance", label: "Финансы", icon: FinanceIcon, roles: ["OWNER", "MARKETING"] },
  { href: "/settings", label: "Настройки", icon: SettingsIcon },
];

function isLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/contacts") {
    return pathname === "/contacts" || (pathname.startsWith("/contacts/") && !pathname.startsWith("/contacts/kanban"));
  }
  return pathname.startsWith(href);
}

function NavLinks({ pathname, role, onNavigate }: { pathname: string; role: UserRole; onNavigate?: () => void }) {
  const visibleLinks = links.filter((link) => !link.roles || link.roles.includes(role));
  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-3">
      {visibleLinks.map((link, i) => {
        const isActive = isLinkActive(pathname, link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            style={{ "--stagger-i": i } as React.CSSProperties}
            className={
              isActive
                ? "stagger-item transition-smooth relative flex items-center gap-2.5 rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm"
                : "stagger-item transition-smooth relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-ink-600 hover:bg-ink-100 hover:text-ink-900"
            }
          >
            <Icon className={`h-[18px] w-[18px] flex-shrink-0 transition-smooth ${isActive ? "" : "opacity-70"}`} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ userName, role }: { userName: string; role: UserRole }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-ink-200 bg-white md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-800 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-lime-400" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink-900">RE ZERO CRM</span>
        </div>
        <NavLinks pathname={pathname} role={role} />
        <div className="mt-auto border-t border-ink-100 px-3 py-4">
          <div className="transition-smooth flex items-center justify-between rounded-lg px-3 py-2 hover:bg-ink-50">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200/60">
                {userName.slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 overflow-hidden">
                <span className="block truncate text-sm text-ink-700">{userName}</span>
                <span className="block truncate text-[11px] text-ink-400">{roleLabels[role]}</span>
              </span>
            </div>
            <form action={logout}>
              <button
                type="submit"
                title="Выйти"
                className="transition-smooth flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-ink-400 hover:bg-danger-100 hover:text-danger-600"
              >
                <LogoutIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-200 bg-white/95 px-4 py-3 backdrop-blur-sm md:hidden">
        <span className="flex items-center gap-2.5 text-sm font-semibold text-ink-900">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-800">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
          </span>
          RE ZERO CRM
        </span>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Меню"
          className="transition-smooth flex h-9 w-9 items-center justify-center rounded-md text-brand-700 hover:bg-brand-50 active:scale-95"
        >
          <MenuIcon />
        </button>
      </header>

      {/* Mobile drawer — always mounted, animated via transform/opacity so open/close is smooth */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-200 md:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="absolute inset-0 bg-ink-900/40" onClick={() => setMobileOpen(false)} />
        <div
          className={`absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-pop transition-transform duration-200 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-5">
            <span className="flex items-center gap-2.5 text-sm font-semibold text-ink-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-800">
                <span className="h-2 w-2 rounded-full bg-lime-400" />
              </span>
              RE ZERO CRM
            </span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Закрыть"
              className="transition-smooth flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 active:scale-95"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <NavLinks pathname={pathname} role={role} onNavigate={() => setMobileOpen(false)} />
          <div className="mt-auto border-t border-ink-100 px-3 py-4">
            <div className="flex items-center justify-between rounded-lg px-3 py-2">
              <span className="min-w-0 overflow-hidden">
                <span className="block truncate text-sm text-ink-700">{userName}</span>
                <span className="block truncate text-[11px] text-ink-400">{roleLabels[role]}</span>
              </span>
              <form action={logout}>
                <button type="submit" className="flex-shrink-0 text-sm text-ink-500 transition hover:text-danger-600">
                  Выйти
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

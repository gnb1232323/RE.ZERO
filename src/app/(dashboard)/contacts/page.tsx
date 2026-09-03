import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { stageLabels, stageOrder, sourceLabels, formatLabels } from "@/lib/labels";
import { StageBadge } from "@/components/contacts/stage-badge";
import { PlusIcon, SearchIcon } from "@/components/icons";
import type { LeadSource, LessonFormat, PipelineStage } from "@/generated/prisma/enums";

type SearchParams = {
  stage?: string;
  source?: string;
  format?: string;
  q?: string;
  hasStudent?: string;
};

const avatarPalette = [
  "bg-brand-100 text-brand-700",
  "bg-lime-100 text-lime-700",
  "bg-khaki-200 text-khaki-600",
  "bg-ink-200 text-ink-700",
];

function avatarClasses(name: string) {
  const idx = name.charCodeAt(0) % avatarPalette.length;
  return avatarPalette[idx];
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const contacts = await prisma.contact.findMany({
    where: {
      deletedAt: null,
      stage: params.stage ? (params.stage as PipelineStage) : undefined,
      source: params.source ? (params.source as LeadSource) : undefined,
      format: params.format ? (params.format as LessonFormat) : undefined,
      student: params.hasStudent === "true" ? { isNot: null } : undefined,
      OR: params.q
        ? [
            { fullName: { contains: params.q, mode: "insensitive" } },
            { phone: { contains: params.q } },
          ]
        : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Контакты</h1>
          <p className="mt-0.5 text-sm text-ink-500">{contacts.length} в списке</p>
        </div>
        <Link
          href="/contacts/new"
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98]"
        >
          <PlusIcon className="h-4 w-4" />
          Новый контакт
        </Link>
      </div>

      <form className="flex flex-wrap items-center gap-2 rounded-xl border border-ink-200 bg-white p-3 shadow-card" method="get">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            placeholder="Поиск по имени или телефону"
            className="w-full rounded-md border border-ink-200 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <select
          name="stage"
          defaultValue={params.stage ?? ""}
          className="rounded-md border border-ink-200 px-2 py-1.5 text-sm text-ink-700 outline-none focus:border-brand-400"
        >
          <option value="">Все стадии</option>
          {stageOrder.map((s) => (
            <option key={s} value={s}>
              {stageLabels[s]}
            </option>
          ))}
        </select>
        <select
          name="source"
          defaultValue={params.source ?? ""}
          className="rounded-md border border-ink-200 px-2 py-1.5 text-sm text-ink-700 outline-none focus:border-brand-400"
        >
          <option value="">Все источники</option>
          {Object.entries(sourceLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="format"
          defaultValue={params.format ?? ""}
          className="rounded-md border border-ink-200 px-2 py-1.5 text-sm text-ink-700 outline-none focus:border-brand-400"
        >
          <option value="">Любой формат</option>
          {Object.entries(formatLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-ink-800 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-ink-900"
        >
          Применить
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-200 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
            <tr>
              <th className="px-4 py-3">Имя</th>
              <th className="px-4 py-3">Телефон</th>
              <th className="px-4 py-3">Стадия</th>
              <th className="px-4 py-3">Источник</th>
              <th className="px-4 py-3">Формат</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-400">
                  Контакты не найдены
                </td>
              </tr>
            )}
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50">
                <td className="px-4 py-2.5">
                  <Link href={`/contacts/${contact.id}`} className="flex items-center gap-2.5">
                    <span
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarClasses(contact.fullName)}`}
                    >
                      {contact.fullName.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="font-medium text-ink-800 hover:text-brand-700">{contact.fullName}</span>
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-ink-600">{contact.phone}</td>
                <td className="px-4 py-2.5">
                  <StageBadge stage={contact.stage} />
                </td>
                <td className="px-4 py-2.5 text-ink-600">{sourceLabels[contact.source]}</td>
                <td className="px-4 py-2.5 text-ink-600">
                  {contact.format ? formatLabels[contact.format] : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

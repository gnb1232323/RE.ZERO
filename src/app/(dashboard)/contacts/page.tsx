import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { stageLabels, stageOrder, sourceLabels, formatLabels } from "@/lib/labels";
import { StageBadge } from "@/components/contacts/stage-badge";
import type { LeadSource, LessonFormat, PipelineStage } from "@/generated/prisma/enums";

type SearchParams = {
  stage?: string;
  source?: string;
  format?: string;
  q?: string;
};

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
        <h1 className="text-lg font-semibold text-brand-800">Контакты</h1>
        <Link
          href="/contacts/new"
          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Новый контакт
        </Link>
      </div>

      <form className="flex flex-wrap gap-2" method="get">
        <input
          type="text"
          name="q"
          defaultValue={params.q}
          placeholder="Поиск по имени или телефону"
          className="rounded-md border border-khaki-300 px-3 py-1.5 text-sm"
        />
        <select name="stage" defaultValue={params.stage ?? ""} className="rounded-md border border-khaki-300 px-2 py-1.5 text-sm">
          <option value="">Все стадии</option>
          {stageOrder.map((s) => (
            <option key={s} value={s}>
              {stageLabels[s]}
            </option>
          ))}
        </select>
        <select name="source" defaultValue={params.source ?? ""} className="rounded-md border border-khaki-300 px-2 py-1.5 text-sm">
          <option value="">Все источники</option>
          {Object.entries(sourceLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select name="format" defaultValue={params.format ?? ""} className="rounded-md border border-khaki-300 px-2 py-1.5 text-sm">
          <option value="">Любой формат</option>
          {Object.entries(formatLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md border border-khaki-300 px-3 py-1.5 text-sm hover:bg-khaki-100">
          Применить
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-khaki-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-khaki-200 bg-khaki-50 text-left text-khaki-500">
            <tr>
              <th className="px-4 py-2 font-medium">Имя</th>
              <th className="px-4 py-2 font-medium">Телефон</th>
              <th className="px-4 py-2 font-medium">Стадия</th>
              <th className="px-4 py-2 font-medium">Источник</th>
              <th className="px-4 py-2 font-medium">Формат</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-khaki-400">
                  Контакты не найдены
                </td>
              </tr>
            )}
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-b border-khaki-100 last:border-0 hover:bg-khaki-50">
                <td className="px-4 py-2">
                  <Link href={`/contacts/${contact.id}`} className="font-medium text-brand-800 hover:underline">
                    {contact.fullName}
                  </Link>
                </td>
                <td className="px-4 py-2 text-khaki-600">{contact.phone}</td>
                <td className="px-4 py-2">
                  <StageBadge stage={contact.stage} />
                </td>
                <td className="px-4 py-2 text-khaki-600">{sourceLabels[contact.source]}</td>
                <td className="px-4 py-2 text-khaki-600">
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

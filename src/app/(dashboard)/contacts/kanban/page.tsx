import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { stageColors, stageLabels, stageOrder } from "@/lib/labels";
import { StageSelect } from "@/components/contacts/stage-select";

export default async function KanbanPage() {
  const contacts = await prisma.contact.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const byStage = Object.fromEntries(stageOrder.map((s) => [s, [] as typeof contacts]));
  for (const contact of contacts) {
    byStage[contact.stage]?.push(contact);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-brand-800">Канбан</h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stageOrder.map((stage) => (
          <div key={stage} className="w-64 flex-shrink-0">
            <div className={`mb-2 rounded-t-md border-t-2 px-2 py-1.5 ${stageColors[stage].border} ${stageColors[stage].bg}`}>
              <div className="flex items-center justify-between">
                <h2 className={`flex items-center gap-1.5 text-sm font-medium ${stageColors[stage].text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${stageColors[stage].dot}`} />
                  {stageLabels[stage]}
                </h2>
                <span className={`text-xs font-medium ${stageColors[stage].text}`}>{byStage[stage]?.length ?? 0}</span>
              </div>
            </div>
            <div className="space-y-2">
              {byStage[stage]?.map((contact) => (
                <div key={contact.id} className="rounded-lg border border-khaki-200 bg-white p-3">
                  <Link href={`/contacts/${contact.id}`} className="text-sm font-medium text-brand-800 hover:underline">
                    {contact.fullName}
                  </Link>
                  <p className="mb-2 text-xs text-khaki-500">{contact.phone}</p>
                  <StageSelect contactId={contact.id} currentStage={contact.stage} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

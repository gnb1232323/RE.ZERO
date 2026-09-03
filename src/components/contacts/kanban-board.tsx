"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { changeStage } from "@/lib/actions/contacts";
import { stageColors, stageLabels, stageOrder } from "@/lib/labels";
import { StageSelect } from "@/components/contacts/stage-select";
import type { PipelineStage } from "@/generated/prisma/enums";

type KanbanContact = {
  id: string;
  fullName: string;
  phone: string;
  stage: PipelineStage;
};

export function KanbanBoard({ contacts }: { contacts: KanbanContact[] }) {
  const [overrides, setOverrides] = useState<Record<string, PipelineStage>>({});
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const [isPending, startTransition] = useTransition();

  const byStage = useMemo(() => {
    const grouped = Object.fromEntries(stageOrder.map((s) => [s, [] as KanbanContact[]])) as Record<
      PipelineStage,
      KanbanContact[]
    >;
    for (const contact of contacts) {
      const stage = overrides[contact.id] ?? contact.stage;
      grouped[stage]?.push(contact);
    }
    return grouped;
  }, [contacts, overrides]);

  function moveTo(contactId: string, stage: PipelineStage) {
    setOverrides((o) => ({ ...o, [contactId]: stage }));
    startTransition(async () => {
      const fd = new FormData();
      fd.append("contactId", contactId);
      fd.append("stage", stage);
      await changeStage(fd);
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stageOrder.map((stage) => (
        <div
          key={stage}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverStage(stage);
          }}
          onDragLeave={() => setDragOverStage((s) => (s === stage ? null : s))}
          onDrop={(e) => {
            e.preventDefault();
            const contactId = e.dataTransfer.getData("text/plain");
            if (contactId) moveTo(contactId, stage);
            setDragOverStage(null);
          }}
          className="w-64 flex-shrink-0"
        >
          <div className={`mb-2 rounded-t-md border-t-2 px-2 py-1.5 ${stageColors[stage].border} ${stageColors[stage].bg}`}>
            <div className="flex items-center justify-between">
              <h2 className={`flex items-center gap-1.5 text-sm font-medium ${stageColors[stage].text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${stageColors[stage].dot}`} />
                {stageLabels[stage]}
              </h2>
              <span className={`text-xs font-medium ${stageColors[stage].text}`}>{byStage[stage]?.length ?? 0}</span>
            </div>
          </div>
          <div
            className={`min-h-[60px] space-y-2 rounded-md p-1 transition ${
              dragOverStage === stage ? "bg-brand-50 ring-2 ring-brand-200" : ""
            }`}
          >
            {byStage[stage]?.map((contact) => (
              <div
                key={contact.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", contact.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                className={`cursor-grab rounded-lg border border-ink-200 bg-white p-3 shadow-card transition active:cursor-grabbing hover:shadow-pop ${
                  isPending && overrides[contact.id] ? "opacity-60" : ""
                }`}
              >
                <Link href={`/contacts/${contact.id}`} className="text-sm font-medium text-ink-800 hover:text-brand-700">
                  {contact.fullName}
                </Link>
                <p className="mb-2 text-xs text-ink-500">{contact.phone}</p>
                <StageSelect contactId={contact.id} currentStage={contact.stage} />
              </div>
            ))}
            {byStage[stage]?.length === 0 && (
              <div className="rounded-lg border border-dashed border-ink-200 py-4 text-center text-xs text-ink-300">
                Перетащите сюда
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { applyStageChange } from "@/lib/change-stage-client";
import { stageColors, stageLabels, stageOrder } from "@/lib/labels";
import { formatMoney } from "@/lib/money";
import { StageSelect } from "@/components/contacts/stage-select";
import { LostReasonModal } from "@/components/contacts/lost-reason-modal";
import type { PipelineStage } from "@/generated/prisma/enums";

type KanbanContact = {
  id: string;
  fullName: string;
  phone: string;
  stage: PipelineStage;
  paymentAmount: number | null;
};

function stageValue(contacts: KanbanContact[] | undefined) {
  const total = (contacts ?? []).reduce((sum, c) => sum + (c.paymentAmount ?? 0), 0);
  return total > 0 ? formatMoney(total) : null;
}

export function KanbanBoard({ contacts }: { contacts: KanbanContact[] }) {
  const [overrides, setOverrides] = useState<Record<string, PipelineStage>>({});
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const [selectedStage, setSelectedStage] = useState<PipelineStage>("LEAD");
  const [confirmingLostId, setConfirmingLostId] = useState<string | null>(null);
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
    if (stage === "LOST") {
      setConfirmingLostId(contactId);
      return;
    }
    setOverrides((o) => ({ ...o, [contactId]: stage }));
    startTransition(() => applyStageChange(contactId, stage));
  }

  return (
    <>
      {/* Mobile: one stage at a time via tabs — no long horizontal scrolling */}
      <div className="md:hidden">
        <div className="mb-3 -mx-4 flex snap-x gap-1.5 overflow-x-auto px-4 pb-1">
          {stageOrder.map((stage) => {
            const isActive = stage === selectedStage;
            const colors = stageColors[stage];
            return (
              <button
                key={stage}
                type="button"
                onClick={(e) => {
                  setSelectedStage(stage);
                  e.currentTarget.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
                }}
                className={`flex flex-shrink-0 snap-start items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-95 ${
                  isActive ? `${colors.bg} ${colors.text} ring-2 ring-inset ${colors.ring}` : "bg-white text-ink-500 ring-1 ring-inset ring-ink-200"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                {stageLabels[stage]}
                <span className={isActive ? "" : "text-ink-400"}>{byStage[stage]?.length ?? 0}</span>
              </button>
            );
          })}
        </div>
        {stageValue(byStage[selectedStage]) && (
          <p className="mb-2 text-xs text-ink-400">Сумма: {stageValue(byStage[selectedStage])}</p>
        )}
        <div key={selectedStage} className="animate-fade-in space-y-2">
          {byStage[selectedStage]?.length === 0 && (
            <div className="rounded-lg border border-dashed border-ink-200 py-8 text-center text-sm text-ink-400">
              Нет контактов на этой стадии
            </div>
          )}
          {byStage[selectedStage]?.map((contact) => (
            <KanbanCard key={contact.id} contact={contact} isMoving={isPending && Boolean(overrides[contact.id])} />
          ))}
        </div>
      </div>

      {/* Desktop: full multi-column board with drag-and-drop */}
      <div className="hidden gap-4 overflow-x-auto pb-4 md:flex">
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
              {stageValue(byStage[stage]) && (
                <p className={`mt-0.5 text-[11px] ${stageColors[stage].text} opacity-80`}>{stageValue(byStage[stage])}</p>
              )}
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
                  <p className="text-xs text-ink-500">{contact.phone}</p>
                  {contact.paymentAmount ? (
                    <p className="mb-2 text-xs font-medium text-lime-700">{formatMoney(contact.paymentAmount)}</p>
                  ) : (
                    <div className="mb-2" />
                  )}
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

      {confirmingLostId && (
        <LostReasonModal
          onCancel={() => setConfirmingLostId(null)}
          onConfirm={(reason) => {
            const contactId = confirmingLostId;
            setConfirmingLostId(null);
            setOverrides((o) => ({ ...o, [contactId]: "LOST" }));
            startTransition(() => applyStageChange(contactId, "LOST", reason));
          }}
        />
      )}
    </>
  );
}

function KanbanCard({ contact, isMoving }: { contact: KanbanContact; isMoving: boolean }) {
  return (
    <div className={`rounded-lg border border-ink-200 bg-white p-3 shadow-card transition ${isMoving ? "opacity-60" : ""}`}>
      <Link href={`/contacts/${contact.id}`} className="text-sm font-medium text-ink-800 hover:text-brand-700">
        {contact.fullName}
      </Link>
      <p className="text-xs text-ink-500">{contact.phone}</p>
      {contact.paymentAmount ? (
        <p className="mb-2 text-xs font-medium text-lime-700">{formatMoney(contact.paymentAmount)}</p>
      ) : (
        <div className="mb-2" />
      )}
      <StageSelect contactId={contact.id} currentStage={contact.stage} />
    </div>
  );
}

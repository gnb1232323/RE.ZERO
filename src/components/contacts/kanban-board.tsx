"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { applyStageChange } from "@/lib/change-stage-client";
import { stageColors, stageLabels, stageOrder } from "@/lib/labels";
import { formatMoney } from "@/lib/money";
import { avatarClasses } from "@/lib/avatar";
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
  const [draggingId, setDraggingId] = useState<string | null>(null);
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
                className={`transition-smooth flex flex-shrink-0 snap-start items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium active:scale-95 ${
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
            <div className="rounded-xl border border-dashed border-ink-200 py-10 text-center text-sm text-ink-400">
              Нет контактов на этой стадии
            </div>
          )}
          {byStage[selectedStage]?.map((contact, i) => (
            <KanbanCard
              key={contact.id}
              contact={contact}
              isMoving={isPending && Boolean(overrides[contact.id])}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Desktop: full multi-column board with drag-and-drop */}
      <div className="hidden gap-3 overflow-x-auto pb-4 md:flex">
        {stageOrder.map((stage) => {
          const isDragTarget = dragOverStage === stage;
          const colors = stageColors[stage];
          return (
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
                setDraggingId(null);
              }}
              className="w-[264px] flex-shrink-0"
            >
              <div className="mb-2.5 flex items-center justify-between px-1">
                <h2 className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
                  <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                  {stageLabels[stage]}
                  <span className="rounded-full bg-ink-100 px-1.5 py-0.5 text-[11px] font-medium text-ink-500">
                    {byStage[stage]?.length ?? 0}
                  </span>
                </h2>
              </div>
              {stageValue(byStage[stage]) && (
                <p className="mb-2 px-1 text-[11px] font-medium text-ink-400">{stageValue(byStage[stage])}</p>
              )}
              <div
                className={`transition-smooth min-h-[80px] space-y-2 rounded-xl p-1.5 ${
                  isDragTarget ? "bg-brand-50 ring-2 ring-brand-300 ring-offset-2 ring-offset-ink-50" : "bg-ink-100/40"
                }`}
              >
                {byStage[stage]?.map((contact, i) => (
                  <div
                    key={contact.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", contact.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDraggingId(contact.id);
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    style={{ "--stagger-i": i } as React.CSSProperties}
                    className={`stagger-item card-hover group cursor-grab rounded-xl border border-ink-200 bg-white p-3 shadow-card active:cursor-grabbing ${
                      isPending && overrides[contact.id] ? "opacity-60" : ""
                    } ${draggingId === contact.id ? "opacity-40" : ""}`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${avatarClasses(contact.fullName)}`}
                      >
                        {contact.fullName.slice(0, 1).toUpperCase()}
                      </span>
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="min-w-0 flex-1 truncate text-sm font-medium text-ink-800 group-hover:text-brand-700"
                      >
                        {contact.fullName}
                      </Link>
                    </div>
                    <p className="mb-2 truncate text-xs text-ink-400">{contact.phone}</p>
                    {contact.paymentAmount ? (
                      <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-lime-100 px-2 py-0.5 text-xs font-medium text-lime-700">
                        {formatMoney(contact.paymentAmount)}
                      </p>
                    ) : null}
                    <StageSelect contactId={contact.id} currentStage={contact.stage} />
                  </div>
                ))}
                {byStage[stage]?.length === 0 && (
                  <div className="rounded-lg border border-dashed border-ink-300 py-5 text-center text-xs text-ink-400">
                    Перетащите сюда
                  </div>
                )}
              </div>
            </div>
          );
        })}
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

function KanbanCard({ contact, isMoving, index }: { contact: KanbanContact; isMoving: boolean; index: number }) {
  return (
    <div
      style={{ "--stagger-i": index } as React.CSSProperties}
      className={`stagger-item rounded-xl border border-ink-200 bg-white p-3.5 shadow-card ${isMoving ? "opacity-60" : ""}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarClasses(contact.fullName)}`}
        >
          {contact.fullName.slice(0, 1).toUpperCase()}
        </span>
        <Link href={`/contacts/${contact.id}`} className="min-w-0 flex-1 truncate text-sm font-medium text-ink-800 hover:text-brand-700">
          {contact.fullName}
        </Link>
      </div>
      <p className="mb-2 text-xs text-ink-400">{contact.phone}</p>
      {contact.paymentAmount ? (
        <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-lime-100 px-2 py-0.5 text-xs font-medium text-lime-700">
          {formatMoney(contact.paymentAmount)}
        </p>
      ) : null}
      <StageSelect contactId={contact.id} currentStage={contact.stage} />
    </div>
  );
}

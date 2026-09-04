"use client";

import { useRef, useState, useTransition } from "react";
import { applyStageChange } from "@/lib/change-stage-client";
import { stageLabels, stageOrder } from "@/lib/labels";
import { LostReasonModal } from "@/components/contacts/lost-reason-modal";
import type { PipelineStage } from "@/generated/prisma/enums";

export function StageSelect({ contactId, currentStage }: { contactId: string; currentStage: PipelineStage }) {
  const selectRef = useRef<HTMLSelectElement>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmingLost, setConfirmingLost] = useState(false);

  function apply(stage: PipelineStage, reason?: string) {
    startTransition(() => applyStageChange(contactId, stage, reason));
  }

  return (
    <>
      <select
        ref={selectRef}
        name="stage"
        defaultValue={currentStage}
        disabled={isPending}
        onChange={(e) => {
          const stage = e.target.value as PipelineStage;
          if (stage === "LOST") {
            setConfirmingLost(true);
            return;
          }
          apply(stage);
        }}
        className="transition-smooth w-full rounded-lg border border-ink-300 bg-white px-2 py-1 text-xs focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:opacity-50"
      >
        {stageOrder.map((stage) => (
          <option key={stage} value={stage}>
            {stageLabels[stage]}
          </option>
        ))}
      </select>

      {confirmingLost && (
        <LostReasonModal
          onCancel={() => {
            setConfirmingLost(false);
            if (selectRef.current) selectRef.current.value = currentStage;
          }}
          onConfirm={(reason) => {
            setConfirmingLost(false);
            apply("LOST", reason);
          }}
        />
      )}
    </>
  );
}

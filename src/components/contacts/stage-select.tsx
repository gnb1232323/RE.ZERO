"use client";

import { useRef, useTransition } from "react";
import { changeStage } from "@/lib/actions/contacts";
import { stageLabels, stageOrder } from "@/lib/labels";
import type { PipelineStage } from "@/generated/prisma/enums";

export function StageSelect({ contactId, currentStage }: { contactId: string; currentStage: PipelineStage }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) => startTransition(() => changeStage(formData))}
    >
      <input type="hidden" name="contactId" value={contactId} />
      <select
        name="stage"
        defaultValue={currentStage}
        disabled={isPending}
        onChange={() => formRef.current?.requestSubmit()}
        className="w-full rounded-md border border-khaki-300 bg-white px-2 py-1 text-xs disabled:opacity-50"
      >
        {stageOrder.map((stage) => (
          <option key={stage} value={stage}>
            {stageLabels[stage]}
          </option>
        ))}
      </select>
    </form>
  );
}

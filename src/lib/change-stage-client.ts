"use client";

import { changeStage } from "@/lib/actions/contacts";
import type { PipelineStage } from "@/generated/prisma/enums";

export async function applyStageChange(contactId: string, stage: PipelineStage, reason?: string) {
  const fd = new FormData();
  fd.append("contactId", contactId);
  fd.append("stage", stage);
  if (reason) fd.append("reason", reason);
  await changeStage(fd);
}

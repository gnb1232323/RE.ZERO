import { stageColors, stageLabels } from "@/lib/labels";
import type { PipelineStage } from "@/generated/prisma/enums";

export function StageBadge({ stage }: { stage: PipelineStage }) {
  const colors = stageColors[stage];
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${colors.bg} ${colors.text} ${colors.ring}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      {stageLabels[stage]}
    </span>
  );
}

import type { LeadSource, LessonFormat, PaymentStatus, PipelineStage, TaskStatus } from "@/generated/prisma/enums";

export const stageLabels: Record<PipelineStage, string> = {
  LEAD: "Лид",
  TRIAL_BOOKED: "Записан на пробный",
  TRIAL_DONE: "Провёл пробный",
  PAID_ENROLLED: "Оплатил",
  STUDYING: "Учится",
  COMPLETED: "Завершил",
  RENEWED_REFERRAL: "Продлил / реферал",
  LOST: "Отказ",
};

export const stageOrder: PipelineStage[] = [
  "LEAD",
  "TRIAL_BOOKED",
  "TRIAL_DONE",
  "PAID_ENROLLED",
  "STUDYING",
  "COMPLETED",
  "RENEWED_REFERRAL",
  "LOST",
];

/** Color-codes the pipeline: khaki for early/unqualified, purple while in progress,
 * green once money/results land, red for lost. Used on kanban headers, table badges,
 * and dashboard tiles so stage is recognizable at a glance, not just by label text. */
export const stageColors: Record<
  PipelineStage,
  { bg: string; text: string; ring: string; dot: string; border: string }
> = {
  LEAD: { bg: "bg-khaki-100", text: "text-khaki-700", ring: "ring-khaki-300", dot: "bg-khaki-400", border: "border-khaki-400" },
  TRIAL_BOOKED: { bg: "bg-khaki-200", text: "text-khaki-700", ring: "ring-khaki-300", dot: "bg-khaki-500", border: "border-khaki-500" },
  TRIAL_DONE: { bg: "bg-brand-50", text: "text-brand-700", ring: "ring-brand-200", dot: "bg-brand-300", border: "border-brand-300" },
  PAID_ENROLLED: { bg: "bg-brand-100", text: "text-brand-700", ring: "ring-brand-300", dot: "bg-brand-500", border: "border-brand-500" },
  STUDYING: { bg: "bg-brand-100", text: "text-brand-800", ring: "ring-brand-300", dot: "bg-brand-600", border: "border-brand-600" },
  COMPLETED: { bg: "bg-lime-100", text: "text-lime-700", ring: "ring-lime-300", dot: "bg-lime-500", border: "border-lime-500" },
  RENEWED_REFERRAL: { bg: "bg-lime-100", text: "text-lime-700", ring: "ring-lime-400", dot: "bg-lime-600", border: "border-lime-600" },
  LOST: { bg: "bg-danger-100", text: "text-danger-600", ring: "ring-danger-500/30", dot: "bg-danger-500", border: "border-danger-500" },
};

export const sourceLabels: Record<LeadSource, string> = {
  INSTAGRAM: "Instagram",
  WHATSAPP: "WhatsApp",
  TELEGRAM: "Telegram",
  REFERRAL: "Реферал",
  ADS: "Реклама",
  WEBSITE: "Сайт",
  OTHER: "Другое",
};

export const formatLabels: Record<LessonFormat, string> = {
  INDIVIDUAL: "Индивидуальный",
  GROUP: "Групповой",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  UNPAID: "Не оплачено",
  PARTIAL: "Частично",
  PAID: "Оплачено",
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  OPEN: "Открыта",
  DONE: "Выполнена",
  CANCELLED: "Отменена",
};

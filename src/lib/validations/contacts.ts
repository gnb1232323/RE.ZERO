import * as z from "zod";
import { LeadSource, LessonFormat, PipelineStage } from "@/generated/prisma/enums";

const leadSourceValues = Object.values(LeadSource) as [LeadSource, ...LeadSource[]];
const lessonFormatValues = Object.values(LessonFormat) as [LessonFormat, ...LessonFormat[]];
const pipelineStageValues = Object.values(PipelineStage) as [PipelineStage, ...PipelineStage[]];

export const ContactFormSchema = z.object({
  fullName: z.string().trim().min(2, { error: "Введите имя (минимум 2 символа)." }),
  phone: z.string().trim().min(5, { error: "Введите телефон." }),
  email: z.union([z.email({ error: "Некорректный email." }), z.literal("")]).optional(),
  instagram: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  telegram: z.string().trim().optional(),
  source: z.enum(leadSourceValues),
  sourceDetail: z.string().trim().optional(),
  format: z.union([z.enum(lessonFormatValues), z.literal("")]).optional(),
  ownerId: z.union([z.string(), z.literal("")]).optional(),
});

export type ContactFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

export const StageChangeSchema = z.object({
  contactId: z.string().min(1),
  stage: z.enum(pipelineStageValues),
});

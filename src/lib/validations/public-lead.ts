import * as z from "zod";
import { LessonFormat } from "@/generated/prisma/enums";

const lessonFormatValues = Object.values(LessonFormat) as [LessonFormat, ...LessonFormat[]];

export const PublicLeadSchema = z.object({
  fullName: z.string().trim().min(2, { error: "Введите имя." }).max(200),
  phone: z.string().trim().min(5, { error: "Введите телефон." }).max(50),
  format: z.union([z.enum(lessonFormatValues), z.literal("")]).optional(),
  comment: z.string().trim().max(1000).optional(),
  website: z.string().max(0).optional(), // honeypot — real users never fill this
});

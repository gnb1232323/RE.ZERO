import * as z from "zod";
import { PaymentStatus } from "@/generated/prisma/enums";

const paymentStatusValues = Object.values(PaymentStatus) as [PaymentStatus, ...PaymentStatus[]];

export const StudentFormSchema = z.object({
  contactId: z.string().min(1),
  courseStartDate: z.string().min(1, { error: "Укажите дату начала курса." }),
  targetLevel: z.string().trim().optional(),
  targetDate: z.string().optional(),
  currentLevel: z.string().trim().optional(),
  progressNotes: z.string().trim().optional(),
  paymentAmount: z.string().min(1, { error: "Укажите сумму оплаты." }),
  paymentStatus: z.enum(paymentStatusValues),
  paymentNotes: z.string().trim().optional(),
  pricePerLesson: z.string().optional(),
  lessonDays: z.array(z.string()).optional(),
  scheduleStartDate: z.string().optional(),
});

export type StudentFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

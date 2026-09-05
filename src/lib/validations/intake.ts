import * as z from "zod";

export const IntakeFormSchema = z.object({
  contactId: z.string().min(1),
  interests: z.string().trim().optional(),
  occupation: z.string().trim().optional(),
  goal: z.string().trim().optional(),
  painPoint: z.string().trim().optional(),
  fears: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type IntakeFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

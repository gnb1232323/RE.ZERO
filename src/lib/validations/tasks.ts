import * as z from "zod";

export const TaskFormSchema = z.object({
  contactId: z.string().min(1),
  title: z.string().trim().min(2, { error: "Введите название задачи." }),
  dueAt: z.string().min(1, { error: "Укажите дату." }),
  assignedToId: z.string().min(1, { error: "Выберите ответственного." }),
});

export type TaskFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

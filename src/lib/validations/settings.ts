import * as z from "zod";

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Введите текущий пароль." }),
    newPassword: z.string().min(8, { error: "Минимум 8 символов." }),
    confirmPassword: z.string().min(1, { error: "Повторите новый пароль." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Пароли не совпадают.",
    path: ["confirmPassword"],
  });

export type ChangePasswordState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      success?: boolean;
    }
  | undefined;

import * as z from "zod";
import { UserRole } from "@/generated/prisma/enums";

const userRoleValues = Object.values(UserRole) as [UserRole, ...UserRole[]];

export const CreateUserSchema = z.object({
  name: z.string().trim().min(1, { error: "Введите имя." }),
  email: z.email({ error: "Введите корректный email." }).trim(),
  password: z.string().min(8, { error: "Минимум 8 символов." }),
  role: z.enum(userRoleValues),
});

export type UserFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      success?: boolean;
    }
  | undefined;

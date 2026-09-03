import * as z from "zod";

export const LoginFormSchema = z.object({
  email: z.email({ error: "Введите корректный email." }).trim(),
  password: z.string().min(1, { error: "Введите пароль." }),
});

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

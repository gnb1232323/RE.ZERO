import * as z from "zod";

export const PublicLeadSchema = z.object({
  fullName: z.string().trim().min(2, { error: "Введите ФИО." }).max(200),
  phone: z.string().trim().min(5, { error: "Введите телефон." }).max(50),
  age: z.coerce.number().int().min(5, { error: "Некорректный возраст." }).max(99, { error: "Некорректный возраст." }),
  email: z.union([z.email({ error: "Некорректный email." }), z.literal("")]).optional(),
  comment: z.string().trim().max(1000).optional(),
  website: z.string().max(0).optional(), // honeypot — real users never fill this
});

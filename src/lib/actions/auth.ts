"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { verifySession } from "@/lib/dal";
import { LoginFormSchema, type LoginFormState } from "@/lib/validations/auth";
import { ChangePasswordSchema, type ChangePasswordState } from "@/lib/validations/settings";

export async function login(_state: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: "Неверный email или пароль." };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return { message: "Неверный email или пароль." };
  }

  await createSession({ userId: user.id, email: user.email, name: user.name });
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function changePassword(
  _state: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await verifySession();

  const validated = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return { message: "Пользователь не найден." };
  }

  const currentMatches = await bcrypt.compare(validated.data.currentPassword, user.passwordHash);
  if (!currentMatches) {
    return { message: "Текущий пароль неверен." };
  }

  const passwordHash = await bcrypt.hash(validated.data.newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true, message: "Пароль изменён." };
}

"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireRole, verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { CreateUserSchema, type UserFormState } from "@/lib/validations/users";
import type { UserRole } from "@/generated/prisma/enums";

export async function createUser(_state: UserFormState, formData: FormData): Promise<UserFormState> {
  await requireRole("OWNER");

  const validated = CreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, email, password, role } = validated.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { message: "Пользователь с таким email уже есть." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, email, passwordHash, role } });

  revalidatePath("/settings");
  return { success: true, message: `Сотрудник ${name} создан.` };
}

export async function updateUserRole(userId: string, role: UserRole) {
  await requireRole("OWNER");
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/settings");
}

export async function deleteUser(userId: string) {
  const session = await requireRole("OWNER");
  if (session.id === userId) {
    return;
  }
  // Soft delete: preserves historical activity/task/receipt records that reference
  // this user, and blocks future logins (see login() in actions/auth.ts).
  await prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } });
  revalidatePath("/settings");
}

export async function getCurrentSessionUserId() {
  const session = await verifySession();
  return session.userId;
}

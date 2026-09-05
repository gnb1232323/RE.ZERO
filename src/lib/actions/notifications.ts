"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function notificationsWhereForCurrentUser(): Promise<Prisma.NotificationWhereInput> {
  const user = await getCurrentUser();
  if (user.role === "OWNER") return {};
  return {
    contact: {
      OR: [{ ownerId: user.id }, { teacherId: user.id }],
    },
  };
}

export async function markNotificationRead(id: string) {
  await getCurrentUser();
  await prisma.notification.update({ where: { id }, data: { read: true } });
  revalidatePath("/", "layout");
}

export async function markAllNotificationsRead() {
  const where = await notificationsWhereForCurrentUser();
  await prisma.notification.updateMany({ where: { ...where, read: false }, data: { read: true } });
  revalidatePath("/", "layout");
}

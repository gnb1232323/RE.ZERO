"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

const SUGGESTIONS = [
  "Отправить мем про английский",
  "Спросить, как продвигается практика",
  "Прислать короткое видео/подкаст по теме урока",
  "Узнать, как дела и настроение перед следующим уроком",
  "Поделиться небольшим лайфхаком по языку",
  "Похвалить за прогресс, отметить конкретный успех",
];

export async function createTouchpointTask(contactId: string) {
  const session = await verifySession();

  const title = `Точка касания: ${SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]}`;
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 3);

  await prisma.task.create({
    data: { contactId, title, dueAt, createdById: session.userId },
  });

  revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/tasks");
  revalidatePath("/");
}

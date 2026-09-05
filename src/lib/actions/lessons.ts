"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { computeEngagement } from "@/lib/engagement";
import { formatMoney } from "@/lib/money";
import type { LessonStatus } from "@/generated/prisma/enums";

export async function markLessonStatus(lessonId: string, status: LessonStatus, wasLate: boolean) {
  await verifySession();

  const lesson = await prisma.lessonSlot.findUnique({
    where: { id: lessonId },
    include: { student: { include: { contact: { select: { id: true, fullName: true } } } } },
  });
  if (!lesson) return;

  const wasAlreadyCompleted = lesson.status === "COMPLETED";
  await prisma.lessonSlot.update({ where: { id: lessonId }, data: { status, wasLate } });

  if (status === "COMPLETED" && !wasAlreadyCompleted && lesson.student.pricePerLesson) {
    const price = Number(lesson.student.pricePerLesson);
    const newBalance = Number(lesson.student.lessonBalance) - price;
    await prisma.student.update({ where: { id: lesson.studentId }, data: { lessonBalance: newBalance } });

    const contactId = lesson.student.contact.id;
    const studentName = lesson.student.contact.fullName;

    if (newBalance < 0) {
      await notify({
        contactId,
        type: "debt",
        title: `Задолженность: ${studentName}`,
        body: `Баланс ушёл в минус на ${formatMoney(Math.abs(newBalance))}. Нужно напомнить об оплате.`,
        link: `/contacts/${contactId}`,
      });
    } else if (newBalance < price) {
      await notify({
        contactId,
        type: "debt",
        title: `Скоро закончится оплата: ${studentName}`,
        body: `Остался баланс на ${formatMoney(newBalance)} — меньше одного урока.`,
        link: `/contacts/${contactId}`,
      });
    }
  }

  revalidatePath("/teaching");
  revalidatePath(`/teaching/${lesson.student.contact.id}`);
}

export async function rateLesson(lessonId: string, lessonRating: number, engagementRating: number, notes: string) {
  await verifySession();

  const lesson = await prisma.lessonSlot.update({
    where: { id: lessonId },
    data: { lessonRating, engagementRating, notes: notes || null },
    include: { student: { include: { contact: { select: { id: true, fullName: true } } } } },
  });

  const stats = await computeEngagement(lesson.studentId);
  if (stats.risk === "HIGH") {
    await notify({
      contactId: lesson.student.contact.id,
      type: "engagement",
      title: `Низкая вовлечённость: ${lesson.student.contact.fullName}`,
      body: `Посещения ${Math.round(stats.attendancePct)}%, средняя оценка ${stats.avgEngagement?.toFixed(1)}.`,
      link: `/engagement`,
    });
  }

  revalidatePath("/teaching");
  revalidatePath(`/teaching/${lesson.student.contact.id}`);
  revalidatePath("/engagement");
}

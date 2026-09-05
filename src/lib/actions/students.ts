"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { StudentFormSchema, type StudentFormState } from "@/lib/validations/students";
import { findOrCreateStudentFolder, uploadReceipt } from "@/lib/google-drive";
import { generateStudentCode } from "@/lib/student-code";
import { generateLessonDates } from "@/lib/lesson-schedule";

const RECEIPT_MAX_BYTES = 15 * 1024 * 1024;
const RECEIPT_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

export async function upsertStudent(_state: StudentFormState, formData: FormData): Promise<StudentFormState> {
  const session = await verifySession();

  const validated = StudentFormSchema.safeParse({
    contactId: formData.get("contactId"),
    courseStartDate: formData.get("courseStartDate"),
    targetLevel: formData.get("targetLevel") ?? "",
    targetDate: formData.get("targetDate") ?? "",
    currentLevel: formData.get("currentLevel") ?? "",
    progressNotes: formData.get("progressNotes") ?? "",
    paymentAmount: formData.get("paymentAmount"),
    paymentStatus: formData.get("paymentStatus"),
    paymentNotes: formData.get("paymentNotes") ?? "",
    pricePerLesson: formData.get("pricePerLesson") ?? "",
    lessonDays: formData.getAll("lessonDays").map(String),
    scheduleStartDate: formData.get("scheduleStartDate") ?? "",
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const data = validated.data;

  const [contact, existing] = await Promise.all([
    prisma.contact.findUniqueOrThrow({ where: { id: data.contactId }, select: { fullName: true, teacherId: true } }),
    prisma.student.findUnique({ where: { contactId: data.contactId } }),
  ]);

  const receiptFile = formData.get("receipt");
  const hasReceiptFile = receiptFile instanceof File && receiptFile.size > 0;

  const isNewPayment =
    data.paymentStatus !== "UNPAID" &&
    (!existing ||
      existing.paymentStatus !== data.paymentStatus ||
      Number(existing.paymentAmount) !== Number(data.paymentAmount));

  if (isNewPayment && !hasReceiptFile) {
    return { message: "Прикрепите фото или файл чека для этой оплаты." };
  }

  if (hasReceiptFile) {
    const file = receiptFile as File;
    if (file.size > RECEIPT_MAX_BYTES) {
      return { message: "Файл чека слишком большой (максимум 15 МБ)." };
    }
    if (!RECEIPT_ALLOWED_TYPES.includes(file.type)) {
      return { message: "Чек должен быть фото (JPG/PNG/WEBP/HEIC) или PDF." };
    }
  }

  const paymentDelta = isNewPayment ? Number(data.paymentAmount) - (existing ? Number(existing.paymentAmount) : 0) : 0;
  const pricePerLesson = data.pricePerLesson ? Number(data.pricePerLesson) : existing?.pricePerLesson ? Number(existing.pricePerLesson) : null;
  const newLessonBalance = Number(existing?.lessonBalance ?? 0) + Math.max(0, paymentDelta);
  const code = existing?.code ?? (await generateStudentCode());

  const student = await prisma.student.upsert({
    where: { contactId: data.contactId },
    update: {
      courseStartDate: new Date(data.courseStartDate),
      targetLevel: data.targetLevel || null,
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
      currentLevel: data.currentLevel || null,
      progressNotes: data.progressNotes || null,
      paymentAmount: data.paymentAmount,
      paymentStatus: data.paymentStatus,
      paymentNotes: data.paymentNotes || null,
      pricePerLesson,
      lessonBalance: newLessonBalance,
    },
    create: {
      contactId: data.contactId,
      code,
      courseStartDate: new Date(data.courseStartDate),
      targetLevel: data.targetLevel || null,
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
      currentLevel: data.currentLevel || null,
      progressNotes: data.progressNotes || null,
      paymentAmount: data.paymentAmount,
      paymentStatus: data.paymentStatus,
      paymentNotes: data.paymentNotes || null,
      pricePerLesson,
      lessonBalance: newLessonBalance,
    },
  });

  if (paymentDelta > 0 && pricePerLesson && pricePerLesson > 0 && data.lessonDays && data.lessonDays.length > 0 && data.scheduleStartDate) {
    const lessonsToCreate = Math.floor(paymentDelta / pricePerLesson);
    const weekdays = data.lessonDays.map(Number);
    const dates = generateLessonDates(new Date(data.scheduleStartDate), weekdays, lessonsToCreate);
    if (dates.length > 0) {
      await prisma.lessonSlot.createMany({
        data: dates.map((scheduledAt) => ({
          studentId: student.id,
          teacherId: contact.teacherId,
          scheduledAt,
        })),
      });
    }
  }

  if (hasReceiptFile) {
    const file = receiptFile as File;
    try {
      const studentFolderId = await findOrCreateStudentFolder(contact.fullName, student.driveFolderId);
      if (studentFolderId !== student.driveFolderId) {
        await prisma.student.update({ where: { id: student.id }, data: { driveFolderId: studentFolderId } });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
      const dateLabel = new Date().toISOString().slice(0, 10);
      const fileName = `${contact.fullName} — чек — ${dateLabel}${ext}`;

      const { fileId, viewLink } = await uploadReceipt({
        fileName,
        mimeType: file.type,
        buffer,
        studentFolderId,
      });

      await prisma.receipt.create({
        data: {
          studentId: student.id,
          fileName,
          driveFileId: fileId,
          driveViewLink: viewLink,
          paymentAmount: data.paymentAmount,
          paymentStatus: data.paymentStatus,
          uploadedById: session.userId,
        },
      });
    } catch (error) {
      console.error("Failed to upload receipt to Google Drive", error);
      return { message: "Оплата сохранена, но не удалось загрузить чек на Google Диск. Попробуйте ещё раз." };
    }
  }

  revalidatePath(`/contacts/${data.contactId}`);
}

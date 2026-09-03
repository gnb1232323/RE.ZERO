"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { StudentFormSchema, type StudentFormState } from "@/lib/validations/students";

export async function upsertStudent(_state: StudentFormState, formData: FormData): Promise<StudentFormState> {
  await verifySession();

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
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const data = validated.data;

  await prisma.student.upsert({
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
    },
    create: {
      contactId: data.contactId,
      courseStartDate: new Date(data.courseStartDate),
      targetLevel: data.targetLevel || null,
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
      currentLevel: data.currentLevel || null,
      progressNotes: data.progressNotes || null,
      paymentAmount: data.paymentAmount,
      paymentStatus: data.paymentStatus,
      paymentNotes: data.paymentNotes || null,
    },
  });

  revalidatePath(`/contacts/${data.contactId}`);
}

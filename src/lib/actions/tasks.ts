"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { TaskFormSchema, TaskEditSchema, type TaskFormState } from "@/lib/validations/tasks";

export async function createTask(_state: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const session = await verifySession();

  const validated = TaskFormSchema.safeParse({
    contactId: formData.get("contactId"),
    title: formData.get("title"),
    dueAt: formData.get("dueAt"),
    assignedToId: formData.get("assignedToId"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { contactId, title, dueAt, assignedToId } = validated.data;

  await prisma.$transaction([
    prisma.task.create({
      data: {
        contactId,
        title,
        dueAt: new Date(dueAt),
        assignedToId,
        createdById: session.userId,
      },
    }),
    prisma.activity.create({
      data: {
        contactId,
        authorId: session.userId,
        type: "TASK_CREATED",
        body: `Задача создана: ${title}`,
      },
    }),
  ]);

  revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/");
  revalidatePath("/tasks");
}

export async function completeTask(taskId: string) {
  const session = await verifySession();

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.status === "DONE") return;

  await prisma.$transaction([
    prisma.task.update({
      where: { id: taskId },
      data: { status: "DONE", completedAt: new Date() },
    }),
    prisma.activity.create({
      data: {
        contactId: task.contactId,
        authorId: session.userId,
        type: "TASK_COMPLETED",
        body: `Задача выполнена: ${task.title}`,
      },
    }),
  ]);

  revalidatePath(`/contacts/${task.contactId}`);
  revalidatePath("/");
  revalidatePath("/tasks");
}

export async function reopenTask(taskId: string) {
  const session = await verifySession();

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.status !== "DONE") return;

  await prisma.$transaction([
    prisma.task.update({
      where: { id: taskId },
      data: { status: "OPEN", completedAt: null },
    }),
    prisma.activity.create({
      data: {
        contactId: task.contactId,
        authorId: session.userId,
        type: "SYSTEM",
        body: `Задача возвращена в работу: ${task.title}`,
      },
    }),
  ]);

  revalidatePath(`/contacts/${task.contactId}`);
  revalidatePath("/");
  revalidatePath("/tasks");
}

export async function updateTask(_state: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const session = await verifySession();

  const validated = TaskEditSchema.safeParse({
    taskId: formData.get("taskId"),
    title: formData.get("title"),
    dueAt: formData.get("dueAt"),
    assignedToId: formData.get("assignedToId") ?? "",
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { taskId, title, dueAt, assignedToId } = validated.data;

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    return { message: "Задача не найдена." };
  }

  await prisma.$transaction([
    prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        dueAt: new Date(dueAt),
        assignedToId: assignedToId || null,
      },
    }),
    prisma.activity.create({
      data: {
        contactId: task.contactId,
        authorId: session.userId,
        type: "SYSTEM",
        body: `Задача изменена: ${title}`,
      },
    }),
  ]);

  revalidatePath(`/contacts/${task.contactId}`);
  revalidatePath("/");
  revalidatePath("/tasks");
}

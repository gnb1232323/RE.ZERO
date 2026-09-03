"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ContactFormSchema, StageChangeSchema, type ContactFormState } from "@/lib/validations/contacts";

function emptyToUndefined(value: string | undefined) {
  return value && value.trim() !== "" ? value.trim() : undefined;
}

export async function createContact(_state: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const session = await verifySession();

  const validated = ContactFormSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    instagram: formData.get("instagram") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    telegram: formData.get("telegram") ?? "",
    source: formData.get("source"),
    sourceDetail: formData.get("sourceDetail") ?? "",
    format: formData.get("format") ?? "",
    ownerId: formData.get("ownerId") ?? "",
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const data = validated.data;

  if (formData.get("confirmDuplicate") !== "true") {
    const existing = await prisma.contact.findFirst({
      where: { phone: data.phone, deletedAt: null },
      select: { id: true, fullName: true, phone: true },
    });
    if (existing) {
      return { duplicate: existing };
    }
  }

  const contact = await prisma.contact.create({
    data: {
      fullName: data.fullName,
      phone: data.phone,
      email: emptyToUndefined(data.email),
      instagram: emptyToUndefined(data.instagram),
      whatsapp: emptyToUndefined(data.whatsapp),
      telegram: emptyToUndefined(data.telegram),
      source: data.source,
      sourceDetail: emptyToUndefined(data.sourceDetail),
      format: data.format || undefined,
      ownerId: emptyToUndefined(data.ownerId),
    },
  });

  await prisma.activity.create({
    data: {
      contactId: contact.id,
      authorId: session.userId,
      type: "SYSTEM",
      body: "Контакт создан",
    },
  });

  revalidatePath("/contacts");
  redirect(`/contacts/${contact.id}`);
}

export async function updateContact(_state: ContactFormState, formData: FormData): Promise<ContactFormState> {
  await verifySession();

  const contactId = String(formData.get("contactId") ?? "");
  if (!contactId) return { message: "Не указан контакт." };

  const validated = ContactFormSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    instagram: formData.get("instagram") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    telegram: formData.get("telegram") ?? "",
    source: formData.get("source"),
    sourceDetail: formData.get("sourceDetail") ?? "",
    format: formData.get("format") ?? "",
    ownerId: formData.get("ownerId") ?? "",
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const data = validated.data;

  await prisma.contact.update({
    where: { id: contactId },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      email: emptyToUndefined(data.email) ?? null,
      instagram: emptyToUndefined(data.instagram) ?? null,
      whatsapp: emptyToUndefined(data.whatsapp) ?? null,
      telegram: emptyToUndefined(data.telegram) ?? null,
      source: data.source,
      sourceDetail: emptyToUndefined(data.sourceDetail) ?? null,
      format: data.format || null,
      ownerId: emptyToUndefined(data.ownerId) ?? null,
    },
  });

  revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/contacts");
}

export async function changeStage(formData: FormData) {
  const session = await verifySession();

  const validated = StageChangeSchema.safeParse({
    contactId: formData.get("contactId"),
    stage: formData.get("stage"),
  });

  if (!validated.success) return;

  const { contactId, stage } = validated.data;

  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact) return;

  const fromStage = contact.stage;
  if (fromStage === stage) return;

  const reason = String(formData.get("reason") ?? "").trim();
  const body =
    stage === "LOST" && reason
      ? `Стадия изменена: ${fromStage} → ${stage}. Причина: ${reason}`
      : `Стадия изменена: ${fromStage} → ${stage}`;

  await prisma.$transaction([
    prisma.contact.update({
      where: { id: contactId },
      data: { stage },
    }),
    prisma.activity.create({
      data: {
        contactId,
        authorId: session.userId,
        type: "STAGE_CHANGE",
        body,
        metadata: { from: fromStage, to: stage, reason: reason || undefined },
      },
    }),
  ]);

  revalidatePath("/contacts");
  revalidatePath("/contacts/kanban");
  revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/");
}

export async function softDeleteContact(contactId: string) {
  await verifySession();
  await prisma.contact.update({
    where: { id: contactId },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/contacts");
  redirect("/contacts");
}

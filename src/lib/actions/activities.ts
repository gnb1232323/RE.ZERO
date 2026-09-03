"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function addNote(formData: FormData) {
  const session = await verifySession();

  const contactId = String(formData.get("contactId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!contactId || !body) return;

  await prisma.$transaction([
    prisma.activity.create({
      data: { contactId, authorId: session.userId, type: "NOTE", body },
    }),
    prisma.contact.update({
      where: { id: contactId },
      data: { lastContactedAt: new Date() },
    }),
  ]);

  revalidatePath(`/contacts/${contactId}`);
}

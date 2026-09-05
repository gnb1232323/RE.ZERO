"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { IntakeFormSchema, type IntakeFormState } from "@/lib/validations/intake";

export async function upsertIntake(_state: IntakeFormState, formData: FormData): Promise<IntakeFormState> {
  const session = await verifySession();

  const validated = IntakeFormSchema.safeParse({
    contactId: formData.get("contactId"),
    interests: formData.get("interests") ?? "",
    occupation: formData.get("occupation") ?? "",
    goal: formData.get("goal") ?? "",
    painPoint: formData.get("painPoint") ?? "",
    fears: formData.get("fears") ?? "",
    notes: formData.get("notes") ?? "",
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { contactId, ...fields } = validated.data;

  await prisma.intakeProfile.upsert({
    where: { contactId },
    update: {
      interests: fields.interests || null,
      occupation: fields.occupation || null,
      goal: fields.goal || null,
      painPoint: fields.painPoint || null,
      fears: fields.fears || null,
      notes: fields.notes || null,
    },
    create: {
      contactId,
      interests: fields.interests || null,
      occupation: fields.occupation || null,
      goal: fields.goal || null,
      painPoint: fields.painPoint || null,
      fears: fields.fears || null,
      notes: fields.notes || null,
      createdById: session.userId,
    },
  });

  revalidatePath(`/contacts/${contactId}`);
  revalidatePath(`/teaching/${contactId}`);
}

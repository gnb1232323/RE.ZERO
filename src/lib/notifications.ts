import { prisma } from "@/lib/prisma";
import { notifyTelegram } from "@/lib/telegram";

const CRM_BASE_URL = process.env.CRM_BASE_URL ?? "https://crm.159-65-231-17.sslip.io";

/** Creates an in-CRM notification (bell) and mirrors it to Telegram, unless an unread
 * notification of the same type already exists for this contact (avoids spamming on
 * every subsequent lesson while the underlying issue is still unresolved). */
export async function notify({
  contactId,
  type,
  title,
  body,
  link,
}: {
  contactId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
}) {
  const existing = await prisma.notification.findFirst({
    where: { contactId, type, read: false },
    select: { id: true },
  });
  if (existing) return;

  await prisma.notification.create({
    data: { contactId, type, title, body, link },
  });

  await notifyTelegram(`🔔 <b>${title}</b>${body ? `\n${body}` : ""}\n\n${CRM_BASE_URL}${link ?? `/contacts/${contactId}`}`);
}

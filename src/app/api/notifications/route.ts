import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificationsWhereForCurrentUser } from "@/lib/actions/notifications";

export async function GET() {
  const where = await notificationsWhereForCurrentUser();
  const notifications = await prisma.notification.findMany({
    where: { ...where, read: false },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ notifications });
}

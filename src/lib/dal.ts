import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { decrypt, getSessionCookie } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/generated/prisma/enums";

export const verifySession = cache(async () => {
  const cookie = await getSessionCookie();
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.userId };
});

export const getCurrentUser = cache(async () => {
  const session = await verifySession();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  });

  return user;
});

/** Redirects home if the current user's role isn't in `allowed`. Use at the top of a page/layout. */
export async function requireRole(...allowed: UserRole[]) {
  const user = await getCurrentUser();
  if (!user || !allowed.includes(user.role)) {
    redirect("/");
  }
  return user;
}

import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTransition } from "@/components/layout/page-transition";
import { notificationsWhereForCurrentUser } from "@/lib/actions/notifications";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const where = await notificationsWhereForCurrentUser();
  const notifications = await prisma.notification.findMany({
    where: { ...where, read: false },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar
        userName={user?.name ?? ""}
        role={user?.role ?? "OWNER"}
        notifications={notifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
      />
      <main className="min-w-0 flex-1 px-4 py-6 md:ml-60 md:px-8 md:py-8">
        <div className="mx-auto w-full max-w-6xl">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}

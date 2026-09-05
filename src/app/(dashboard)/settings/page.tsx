import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { UserManagement } from "@/components/settings/user-management";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const users =
    user.role === "OWNER"
      ? await prisma.user.findMany({
          where: { deletedAt: null },
          select: { id: true, name: true, email: true, role: true },
          orderBy: { createdAt: "asc" },
        })
      : null;

  return (
    <div className="animate-fade-in max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Настройки</h1>

      <ChangePasswordForm />

      {users && (
        <div>
          <h2 className="mb-3 text-lg font-semibold tracking-tight text-ink-900">Доступы сотрудников</h2>
          <UserManagement users={users} currentUserId={user.id} />
        </div>
      )}
    </div>
  );
}

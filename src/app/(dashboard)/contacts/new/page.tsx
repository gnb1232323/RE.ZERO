import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { ContactForm } from "@/components/contacts/contact-form";

export default async function NewContactPage() {
  await requireRole("OWNER", "SALES");

  const owners = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="animate-fade-in max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Новый контакт</h1>
      <div className="card-hover rounded-2xl border border-ink-200 bg-white p-5 shadow-card sm:p-6">
        <ContactForm owners={owners} />
      </div>
    </div>
  );
}

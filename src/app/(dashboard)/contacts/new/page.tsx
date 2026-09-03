import { prisma } from "@/lib/prisma";
import { ContactForm } from "@/components/contacts/contact-form";

export default async function NewContactPage() {
  const owners = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold text-ink-900">Новый контакт</h1>
      <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
        <ContactForm owners={owners} />
      </div>
    </div>
  );
}

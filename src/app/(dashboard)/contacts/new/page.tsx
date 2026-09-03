import { prisma } from "@/lib/prisma";
import { ContactForm } from "@/components/contacts/contact-form";

export default async function NewContactPage() {
  const owners = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-brand-800">Новый контакт</h1>
      <ContactForm owners={owners} />
    </div>
  );
}

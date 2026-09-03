import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ContactForm } from "@/components/contacts/contact-form";
import { ActivityTimeline } from "@/components/contacts/activity-timeline";
import { StudentPanel, type SerializedStudent } from "@/components/contacts/student-panel";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskList } from "@/components/tasks/task-list";
import { StageSelect } from "@/components/contacts/stage-select";
import { DeleteContactButton } from "@/components/contacts/delete-contact-button";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [contact, users, activities, tasks, student] = await Promise.all([
    prisma.contact.findUnique({ where: { id } }),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.activity.findMany({
      where: { contactId: id },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.findMany({
      where: { contactId: id },
      include: { assignedTo: { select: { name: true } } },
      orderBy: [{ status: "asc" }, { dueAt: "asc" }],
    }),
    prisma.student.findUnique({ where: { contactId: id } }),
  ]);

  if (!contact || contact.deletedAt) {
    notFound();
  }

  const serializedStudent: SerializedStudent | null = student
    ? { ...student, paymentAmount: student.paymentAmount.toString() }
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-brand-800">{contact.fullName}</h1>
            <div className="flex items-center gap-3">
              <div className="w-56">
                <StageSelect contactId={contact.id} currentStage={contact.stage} />
              </div>
              <DeleteContactButton contactId={contact.id} />
            </div>
          </div>
          <ContactForm owners={users} contact={contact} />
        </div>

        <div>
          <h2 className="mb-2 text-sm font-medium text-khaki-700">Активность</h2>
          <ActivityTimeline contactId={contact.id} activities={activities} />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-sm font-medium text-khaki-700">Задачи</h2>
          <div className="space-y-3 rounded-lg border border-khaki-200 bg-white p-4">
            <TaskForm contactId={contact.id} users={users} />
            <TaskList tasks={tasks} />
          </div>
        </div>

        <StudentPanel contactId={contact.id} student={serializedStudent} />
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ContactForm } from "@/components/contacts/contact-form";
import { ActivityTimeline } from "@/components/contacts/activity-timeline";
import { StudentPanel, type SerializedStudent } from "@/components/contacts/student-panel";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskList } from "@/components/tasks/task-list";
import { StageSelect } from "@/components/contacts/stage-select";
import { DeleteContactButton } from "@/components/contacts/delete-contact-button";
import { CoinsIcon, TasksIcon } from "@/components/icons";

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
    <div className="space-y-6">
      <div>
        <Link href="/contacts" className="mb-2 inline-block text-sm text-ink-400 hover:text-brand-700">
          ← Все контакты
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-base font-semibold text-brand-700">
              {contact.fullName.slice(0, 1).toUpperCase()}
            </span>
            <h1 className="text-xl font-semibold text-ink-900">{contact.fullName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-56">
              <StageSelect contactId={contact.id} currentStage={contact.stage} />
            </div>
            <DeleteContactButton contactId={contact.id} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
            <h2 className="mb-4 text-sm font-semibold text-ink-800">Профиль</h2>
            <ContactForm owners={users} contact={contact} />
          </section>

          <section className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
            <h2 className="mb-4 text-sm font-semibold text-ink-800">Активность</h2>
            <ActivityTimeline contactId={contact.id} activities={activities} />
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-100 text-brand-700">
                <TasksIcon className="h-3.5 w-3.5" />
              </span>
              Задачи
            </h2>
            <div className="space-y-3">
              <TaskForm contactId={contact.id} users={users} />
              <TaskList tasks={tasks} />
            </div>
          </section>

          <section className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-lime-100 text-lime-700">
                <CoinsIcon className="h-3.5 w-3.5" />
              </span>
              Студент
            </h2>
            <StudentPanel contactId={contact.id} student={serializedStudent} />
          </section>
        </div>
      </div>
    </div>
  );
}

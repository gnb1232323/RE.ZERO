import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { IntakePanel } from "@/components/contacts/intake-panel";
import { LessonRow } from "@/components/teaching/lesson-row";

export default async function TeachingStudentPage({ params }: { params: Promise<{ contactId: string }> }) {
  const user = await requireRole("OWNER", "TEACHER");
  const { contactId } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      intake: true,
      student: {
        include: { lessons: { orderBy: { scheduledAt: "desc" } } },
      },
    },
  });

  if (!contact || contact.deletedAt || !contact.student) {
    notFound();
  }
  if (user.role === "TEACHER" && contact.teacherId !== user.id) {
    notFound();
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <Link href="/teaching" className="transition-smooth mb-3 inline-flex items-center gap-1 text-sm text-ink-400 hover:text-brand-700">
          <svg viewBox="0 0 12 12" className="h-3 w-3">
            <path d="M7.5 2.5L3 6l4.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          Мои ученики
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{contact.fullName}</h1>
        <p className="mt-0.5 text-sm text-ink-500">Код {contact.student.code}</p>
      </div>

      <section className="card-hover rounded-2xl border border-ink-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-ink-800">Анкета первого контакта</h2>
        <IntakePanel contactId={contact.id} intake={contact.intake} readOnly />
      </section>

      <section className="card-hover rounded-2xl border border-ink-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-ink-800">Уроки</h2>
        {contact.student.lessons.length === 0 ? (
          <p className="text-sm text-ink-400">Уроков пока нет.</p>
        ) : (
          <div className="space-y-2">
            {contact.student.lessons.map((lesson) => (
              <LessonRow key={lesson.id} lesson={{ ...lesson, scheduledAt: lesson.scheduledAt.toISOString() }} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

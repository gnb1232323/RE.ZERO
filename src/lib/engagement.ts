import { prisma } from "@/lib/prisma";

export type EngagementRisk = "LOW" | "MEDIUM" | "HIGH";

export type EngagementStats = {
  totalPast: number;
  attended: number;
  attendancePct: number;
  avgEngagement: number | null;
  coefficient: number | null;
  risk: EngagementRisk | null;
};

/** Посещения (%) = посещённые / общее число прошедших занятий * 100
 *  Средняя оценка = среднее по engagementRating завершённых уроков
 *  Коэффициент = Посещения% * 0.5 + Средняя оценка * 10
 *  Риск: низкий — посещения>=75% и оценка>=4.5; средний — 50-74% или 3.5-4.4; высокий — иначе */
export async function computeEngagement(studentId: string): Promise<EngagementStats> {
  const lessons = await prisma.lessonSlot.findMany({
    where: { studentId, scheduledAt: { lt: new Date() }, status: { in: ["COMPLETED", "NO_SHOW"] } },
    select: { status: true, engagementRating: true },
  });

  const totalPast = lessons.length;
  const attended = lessons.filter((l) => l.status === "COMPLETED").length;
  const attendancePct = totalPast > 0 ? (attended / totalPast) * 100 : 0;

  const ratings = lessons.filter((l) => l.status === "COMPLETED" && l.engagementRating != null).map((l) => l.engagementRating as number);
  const avgEngagement = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  if (totalPast === 0 || avgEngagement === null) {
    return { totalPast, attended, attendancePct, avgEngagement, coefficient: null, risk: null };
  }

  const coefficient = attendancePct * 0.5 + avgEngagement * 10;
  const risk: EngagementRisk =
    attendancePct >= 75 && avgEngagement >= 4.5 ? "LOW" : attendancePct < 50 || avgEngagement < 3.5 ? "HIGH" : "MEDIUM";

  return { totalPast, attended, attendancePct, avgEngagement, coefficient, risk };
}

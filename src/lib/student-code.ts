import { prisma } from "@/lib/prisma";

export async function generateStudentCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = String(1000 + Math.floor(Math.random() * 9000));
    const existing = await prisma.student.findUnique({ where: { code }, select: { id: true } });
    if (!existing) return code;
  }
  throw new Error("Не удалось сгенерировать уникальный код студента.");
}

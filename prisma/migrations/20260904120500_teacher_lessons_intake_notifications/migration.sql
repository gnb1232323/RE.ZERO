-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'TEACHER';

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED');

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN "age" INTEGER,
ADD COLUMN "teacherId" TEXT;

-- AlterTable Student: add code as nullable first, backfill, then enforce NOT NULL + UNIQUE
ALTER TABLE "Student" ADD COLUMN "code" TEXT;
ALTER TABLE "Student" ADD COLUMN "pricePerLesson" DECIMAL(10,2);
ALTER TABLE "Student" ADD COLUMN "lessonBalance" DECIMAL(10,2) NOT NULL DEFAULT 0;

UPDATE "Student" SET "code" = to_char((1000 + floor(random() * 9000))::int, 'FM0000') WHERE "code" IS NULL;

ALTER TABLE "Student" ALTER COLUMN "code" SET NOT NULL;
CREATE UNIQUE INDEX "Student_code_key" ON "Student"("code");

-- CreateTable
CREATE TABLE "IntakeProfile" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "interests" TEXT,
    "occupation" TEXT,
    "goal" TEXT,
    "painPoint" TEXT,
    "fears" TEXT,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntakeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonSlot" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "LessonStatus" NOT NULL DEFAULT 'SCHEDULED',
    "wasLate" BOOLEAN NOT NULL DEFAULT false,
    "lessonRating" INTEGER,
    "engagementRating" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "contactId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntakeProfile_contactId_key" ON "IntakeProfile"("contactId");

-- CreateIndex
CREATE INDEX "LessonSlot_studentId_scheduledAt_idx" ON "LessonSlot"("studentId", "scheduledAt");

-- CreateIndex
CREATE INDEX "LessonSlot_teacherId_scheduledAt_idx" ON "LessonSlot"("teacherId", "scheduledAt");

-- CreateIndex
CREATE INDEX "Notification_read_createdAt_idx" ON "Notification"("read", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_contactId_idx" ON "Notification"("contactId");

-- CreateIndex
CREATE INDEX "Contact_teacherId_idx" ON "Contact"("teacherId");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeProfile" ADD CONSTRAINT "IntakeProfile_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeProfile" ADD CONSTRAINT "IntakeProfile_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSlot" ADD CONSTRAINT "LessonSlot_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSlot" ADD CONSTRAINT "LessonSlot_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

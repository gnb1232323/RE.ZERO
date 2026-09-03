-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "driveFolderId" TEXT;

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "driveFileId" TEXT NOT NULL,
    "driveViewLink" TEXT NOT NULL,
    "paymentAmount" DECIMAL(10,2) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Receipt_studentId_idx" ON "Receipt"("studentId");

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

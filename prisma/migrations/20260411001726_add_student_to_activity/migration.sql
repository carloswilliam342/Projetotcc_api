-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "studentId" TEXT;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

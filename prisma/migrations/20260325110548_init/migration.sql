-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "subject" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "needsTea" BOOLEAN NOT NULL DEFAULT false,
    "needsTdah" BOOLEAN NOT NULL DEFAULT false,
    "otherNeeds" TEXT NOT NULL DEFAULT '',
    "needsObservations" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "neurodivergence" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "performanceLevel" TEXT NOT NULL DEFAULT 'beginner',
    "notes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visualResources" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" INTEGER NOT NULL,
    "adaptedFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_steps" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "activity_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_items" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "activityId" TEXT,
    "reminder" BOOLEAN NOT NULL DEFAULT false,
    "reminderText" TEXT,
    "color" TEXT NOT NULL,

    CONSTRAINT "routine_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_observations" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "behavior" TEXT NOT NULL,
    "participation" TEXT NOT NULL,
    "completion" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "activityId" TEXT,

    CONSTRAINT "lesson_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_records" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "activityTitle" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "difficultyLevel" INTEGER NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "performance_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teachers_login_key" ON "teachers"("login");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_studentId_key" ON "student_profiles"("studentId");

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_steps" ADD CONSTRAINT "activity_steps_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_items" ADD CONSTRAINT "routine_items_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_items" ADD CONSTRAINT "routine_items_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_observations" ADD CONSTRAINT "lesson_observations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_observations" ADD CONSTRAINT "lesson_observations_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_observations" ADD CONSTRAINT "lesson_observations_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_records" ADD CONSTRAINT "performance_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_records" ADD CONSTRAINT "performance_records_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

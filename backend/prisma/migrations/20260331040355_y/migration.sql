-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'trial', 'canceled', 'past_due');

-- CreateEnum
CREATE TYPE "StudentSubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TRAIL', 'EXPIRED', 'CANCELLED', 'END', 'LIMIT_CROSSED');

-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "AuthProviderType" AS ENUM ('EMAIL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "EssayStatus" AS ENUM ('GENERATING', 'SAVED', 'DELETED', 'FAILED', 'EDITED');

-- CreateEnum
CREATE TYPE "OfferDiscountType" AS ENUM ('PERCENT', 'FIXED');

-- CreateEnum
CREATE TYPE "FaqCategory" AS ENUM ('PRICING', 'GETTING_STARTED', 'HOW_IT_WORKS', 'PRIVACY', 'SCHOLARSHIPS', 'TECHNICAL', 'SUPPORT', 'ACADEMIC_INTEGRITY');

-- CreateEnum
CREATE TYPE "ScrapeStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "phoneNumber" TEXT,
    "picture" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isPlan" BOOLEAN DEFAULT false,
    "forgotPasswordStatus" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthProvider" (
    "id" TEXT NOT NULL,
    "provider" "AuthProviderType" NOT NULL,
    "providerId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AuthProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "profilePicture" TEXT,
    "filePath" TEXT,
    "profileUrl" TEXT,
    "bio" TEXT,
    "state" TEXT,
    "gpa" DOUBLE PRECISION,
    "financialNeed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BasicInformation" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "schoolType" TEXT NOT NULL,
    "gpa" DOUBLE PRECISION NOT NULL,
    "grade" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BasicInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtracurricularActivity" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "activityName" TEXT NOT NULL,
    "yearsInvolved" TEXT NOT NULL,
    "leadership" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExtracurricularActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicInterest" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "intendedMajor" TEXT NOT NULL,
    "whyThisField" TEXT NOT NULL,
    "careerGoals" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerWork" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "whatVolunteerWork" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "totalHours" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerWork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyBackground" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "firstGenStatus" TEXT,
    "householdIncomeRange" TEXT,
    "householdSize" INTEGER,
    "familySituations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyBackground_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniqueExperience" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "hobbies" TEXT,
    "uniqueExperiences" TEXT,
    "proudMoment" TEXT,
    "additionalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UniqueExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiversityIdentity" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "genderIdentity" TEXT,
    "religiousIdentity" TEXT,
    "selfIdentification" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiversityIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScholarshipSpecificInfo" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "scholarshipsInterested" TEXT[],
    "specificScholarships" TEXT,
    "scholarshipDeadline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScholarshipSpecificInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnythingElse" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "anythingElse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnythingElse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EssaySpecificQuestions" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "influentialPerson" TEXT,
    "mistakeAndLesson" TEXT,
    "failureStory" TEXT,
    "issueYouCareAbout" TEXT,
    "whatMakesYouDifferent" TEXT,
    "communityChangeIdea" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EssaySpecificQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "major" TEXT,
    "achievements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Essay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userProfileId" TEXT,
    "scholarshipId" TEXT,
    "title" TEXT,
    "prompt" TEXT,
    "contentFinal" TEXT,
    "status" "EssayStatus" NOT NULL DEFAULT 'GENERATING',
    "subject" TEXT,
    "wordCount" INTEGER,
    "voiceUrl" TEXT,
    "documentUrls" TEXT[],
    "voiceFilePath" TEXT,
    "documentFilePath" TEXT[],
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Essay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EssayComparison" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userProfileId" TEXT,
    "essayAId" TEXT NOT NULL,
    "essayBId" TEXT NOT NULL,
    "scoreA" INTEGER NOT NULL,
    "scoreB" INTEGER NOT NULL,
    "strengthsA" TEXT NOT NULL,
    "improvementsA" TEXT NOT NULL,
    "strengthsB" TEXT NOT NULL,
    "improvementsB" TEXT NOT NULL,
    "winner" TEXT NOT NULL,
    "percentageDiff" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EssayComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "subject" TEXT,
    "description" TEXT,
    "images" TEXT[],
    "detailUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scholarshipId" TEXT NOT NULL,
    "score" INTEGER,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "userId" TEXT NOT NULL,
    "essayId" TEXT,
    "scholarshipId" TEXT NOT NULL,
    "essayTitle" TEXT,
    "scholarshipTitle" TEXT NOT NULL,
    "scholarshipAmount" INTEGER,
    "scholarshipDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManualApplication" (
    "id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "userId" TEXT NOT NULL,
    "essayId" TEXT,
    "title" TEXT,
    "type" TEXT,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "provider" TEXT,
    "deadline" TIMESTAMP(3),
    "subject" TEXT,
    "description" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "detailUrl" TEXT,
    "prompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManualApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionStudent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "subscriptionStatus" "StudentSubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "type" "SubscriptionType",
    "payload" JSONB,
    "invoiceUrl" TEXT,
    "invoiceFilePath" TEXT,

    CONSTRAINT "SubscriptionStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studentReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" TEXT,
    "reviewText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studentReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "features" TEXT[],
    "planType" TEXT,
    "durationType" TEXT,
    "monthlyPrice" DOUBLE PRECISION NOT NULL,
    "yearlyPrice" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationRecipient" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "ctaText" TEXT,
    "discountType" "OfferDiscountType" NOT NULL DEFAULT 'PERCENT',
    "discountValue" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "category" "FaqCategory" NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "scholarshipUpdate" BOOLEAN NOT NULL DEFAULT true,
    "applicationReminders" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "userActivityAlerts" BOOLEAN NOT NULL DEFAULT true,
    "systemMaintenanceAlerts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapedData" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "payload" JSONB,
    "status" "ScrapeStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapedData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentInstruction" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "instructionText" TEXT,
    "instructionPrompt" TEXT,
    "aboutScholarshipText" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentInstruction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "AuthProvider_userId_idx" ON "AuthProvider"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthProvider_provider_providerId_key" ON "AuthProvider"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BasicInformation_userProfileId_key" ON "BasicInformation"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ExtracurricularActivity_userProfileId_key" ON "ExtracurricularActivity"("userProfileId");

-- CreateIndex
CREATE INDEX "ExtracurricularActivity_userProfileId_idx" ON "ExtracurricularActivity"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicInterest_userProfileId_key" ON "AcademicInterest"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerWork_userProfileId_key" ON "VolunteerWork"("userProfileId");

-- CreateIndex
CREATE INDEX "VolunteerWork_userProfileId_idx" ON "VolunteerWork"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyBackground_userProfileId_key" ON "FamilyBackground"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "UniqueExperience_userProfileId_key" ON "UniqueExperience"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "DiversityIdentity_userProfileId_key" ON "DiversityIdentity"("userProfileId");

-- CreateIndex
CREATE INDEX "DiversityIdentity_userProfileId_idx" ON "DiversityIdentity"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ScholarshipSpecificInfo_userProfileId_key" ON "ScholarshipSpecificInfo"("userProfileId");

-- CreateIndex
CREATE INDEX "ScholarshipSpecificInfo_userProfileId_idx" ON "ScholarshipSpecificInfo"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "AnythingElse_userProfileId_key" ON "AnythingElse"("userProfileId");

-- CreateIndex
CREATE INDEX "AnythingElse_userProfileId_idx" ON "AnythingElse"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "EssaySpecificQuestions_userProfileId_key" ON "EssaySpecificQuestions"("userProfileId");

-- CreateIndex
CREATE INDEX "EssaySpecificQuestions_userProfileId_idx" ON "EssaySpecificQuestions"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Education_userProfileId_key" ON "Education"("userProfileId");

-- CreateIndex
CREATE INDEX "Education_level_idx" ON "Education"("level");

-- CreateIndex
CREATE INDEX "Education_institutionName_idx" ON "Education"("institutionName");

-- CreateIndex
CREATE INDEX "Education_major_idx" ON "Education"("major");

-- CreateIndex
CREATE UNIQUE INDEX "Scholarship_title_provider_key" ON "Scholarship"("title", "provider");

-- CreateIndex
CREATE INDEX "ManualApplication_userId_idx" ON "ManualApplication"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- CreateIndex
CREATE INDEX "NotificationRecipient_userId_idx" ON "NotificationRecipient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationRecipient_notificationId_userId_key" ON "NotificationRecipient"("notificationId", "userId");

-- CreateIndex
CREATE INDEX "Offer_isActive_idx" ON "Offer"("isActive");

-- CreateIndex
CREATE INDEX "Faq_category_idx" ON "Faq"("category");

-- CreateIndex
CREATE INDEX "Faq_isActive_idx" ON "Faq"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSettings_userId_key" ON "StudentSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "ScrapedData_status_idx" ON "ScrapedData"("status");

-- CreateIndex
CREATE INDEX "ScrapedData_type_idx" ON "ScrapedData"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ScrapedData_url_type_key" ON "ScrapedData"("url", "type");

-- CreateIndex
CREATE UNIQUE INDEX "StudentInstruction_userId_key" ON "StudentInstruction"("userId");

-- AddForeignKey
ALTER TABLE "AuthProvider" ADD CONSTRAINT "AuthProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BasicInformation" ADD CONSTRAINT "BasicInformation_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtracurricularActivity" ADD CONSTRAINT "ExtracurricularActivity_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicInterest" ADD CONSTRAINT "AcademicInterest_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerWork" ADD CONSTRAINT "VolunteerWork_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyBackground" ADD CONSTRAINT "FamilyBackground_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniqueExperience" ADD CONSTRAINT "UniqueExperience_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiversityIdentity" ADD CONSTRAINT "DiversityIdentity_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScholarshipSpecificInfo" ADD CONSTRAINT "ScholarshipSpecificInfo_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnythingElse" ADD CONSTRAINT "AnythingElse_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssaySpecificQuestions" ADD CONSTRAINT "EssaySpecificQuestions_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Essay" ADD CONSTRAINT "Essay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Essay" ADD CONSTRAINT "Essay_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Essay" ADD CONSTRAINT "Essay_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayComparison" ADD CONSTRAINT "EssayComparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayComparison" ADD CONSTRAINT "EssayComparison_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayComparison" ADD CONSTRAINT "EssayComparison_essayAId_fkey" FOREIGN KEY ("essayAId") REFERENCES "Essay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayComparison" ADD CONSTRAINT "EssayComparison_essayBId_fkey" FOREIGN KEY ("essayBId") REFERENCES "Essay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_essayId_fkey" FOREIGN KEY ("essayId") REFERENCES "Essay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualApplication" ADD CONSTRAINT "ManualApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualApplication" ADD CONSTRAINT "ManualApplication_essayId_fkey" FOREIGN KEY ("essayId") REFERENCES "Essay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionStudent" ADD CONSTRAINT "SubscriptionStudent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionStudent" ADD CONSTRAINT "SubscriptionStudent_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studentReview" ADD CONSTRAINT "studentReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSettings" ADD CONSTRAINT "StudentSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentInstruction" ADD CONSTRAINT "StudentInstruction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route.js";
import { ProfileRoutes } from "../modules/profiles/profile/profile.route.js";
import { AuthRouter } from "../modules/auth/auth.route.js";
import { OtpRouter } from "../modules/otp/otp.route.js";
import { AcademicInterestRoutes } from "../modules/profiles/academicInterest/academicInterest.route.js";

import { ExtracurricularActivityRoutes } from "../modules/profiles/extraCurricularActivities/extraCurricularActivities.route.js";
import { BasicInformationRoutes } from "../modules/profiles/basicInformation/basicInformation.route.js";
import { VolunteerRoutes } from "../modules/profiles/VolunteerWorkCommunityService/VolunteerWorkCommunityService.route.js";
import { AdminRoutes } from "../modules/admin/admin.route.js";
import { FamilyBackgroundRoutes } from "../modules/profiles/familyBackgroundCommunityService/familyBackground.route.js";
import { UniqueExperienceRoutes } from "../modules/profiles/uniqueExperience/uniqueExperience.route.js";
import { DiversityIdentityRoutes } from "../modules/profiles/diversityIdentity/diversityIdentity.route.js";
import { ScholarshipSpecificInfoRoutes } from "../modules/profiles/scholarshipSpecificInfo/scholarshipSpecificInfo.route.js";
import { AnythingElseRoutes } from "../modules/profiles/anythingElse/anythingElse.route.js";
import { EssaySpecificQuestionsRoutes } from "../modules/profiles/essaySpecificQuestions/essaySpecificQuestions.route.js";
import { EducationRoutes } from "../modules/profiles/education/education.route.js";
import { GenerateEssayRoutes } from "../modules/generateEssay/generateEssay.route.js";
import { EssayComparisonRoutes } from "../modules/essayComparison/essayComparison.route.js";
import { RecommendationRoutes } from "../modules/recommendation/recommendation.route.js";
import { ApplicationRoute } from "../modules/application/application.route.js";
import { PaymentRoutes } from "../modules/payment/payment.route.js";
import { SubscriptionStudentRouter } from "../modules/subscriptionStudent/subscriptionStudent.route.js";
import { NotificationRoutes } from "../modules/notification/notification.routes.js";
import { DashboardStatsRoutes } from "../modules/dashboardStats/dashboardStats.route.js";
import { SettingsRoutes } from "../modules/admin/settings/settings.route.js";
import { StudentSettingsRoutes } from "../modules/studentSettings/studentSettings.route.js";


import { DataScraperRoutes } from "../modules/admin/data_scraper/dataScraper.route.js";
import { StudentReviewRoutes } from "../modules/studentReview/studentReview.route.js";
import { ManualApplicationRoutes } from "../modules/manualApplication/manualApplication.route.js";
import { StudentInstructionRoutes } from "../modules/studentInstructionForEssay/studentInstruction.route.js";

export const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRouter,
  },
  {
    path: "/otp",
    route: OtpRouter,
  },
  {
    path: "/profile",
    route: ProfileRoutes,
  },
  {
    path: "/profile/basic-information",
    route: BasicInformationRoutes,
  },
  {
    path: "/profile/academic-interest",
    route: AcademicInterestRoutes,
  },
  {
    path: "/profile/extra-curricular-activities",
    route: ExtracurricularActivityRoutes,
  },
  {
    path: "/profile/volunteer-work",
    route: VolunteerRoutes,
  },
  {
    path: "/profile/family-background",
    route: FamilyBackgroundRoutes,
  },
  {
    path: "/profile/unique-experience",
    route: UniqueExperienceRoutes,
  },
  {
    path: "/profile/diversity-identity",
    route: DiversityIdentityRoutes,
  },
  {
    path: "/profile/scholarship-specific-info",
    route: ScholarshipSpecificInfoRoutes,
  },
  {
    path: "/profile/anything-else",
    route: AnythingElseRoutes,
  },
  {
    path: "/profile/essay-specific-questions",
    route: EssaySpecificQuestionsRoutes,
  },
  {
    path: "/profile/education",
    route: EducationRoutes,
  },
  {
    path: "/generate-essay",
    route: GenerateEssayRoutes,
  },
  {
    path: "/essay-comparison",
    route: EssayComparisonRoutes,
  },
  {
    path: "/essay-recommendation",
    route: RecommendationRoutes,
  },
  {
    path: "/application",
    route: ApplicationRoute,
  },
  {
    path: "/subscription-student",
    route: SubscriptionStudentRouter,
  },
  {
    path: "/dashboard-stats",
    route: DashboardStatsRoutes,
  },
  {
    path: "/student-settings",
    route: StudentSettingsRoutes,
  },
  {
    path : "/student-review",
    route : StudentReviewRoutes
  },

  // --------------

  {
    path: "/admin",
    route: AdminRoutes,
  },

  {
    path: "/payment",
    route: PaymentRoutes,
  },

  {
    path: "/notifications",
    route: NotificationRoutes,
  },

  {
    path: "/admin/settings",
    route: SettingsRoutes,
  },

  {
    path: "/data-scraper",
    route: DataScraperRoutes,
  },
  {
    path: "/manual-application",
    route: ManualApplicationRoutes,
  },
  {
    path: "/student-instruction",
    route: StudentInstructionRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

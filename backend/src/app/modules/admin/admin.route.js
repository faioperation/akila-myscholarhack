import express from "express";

import { AdminController } from "./admin.controller.js";
import { Role } from "../../utils/role.js";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";

const router = express.Router();

router.get(
  "/users",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.getUserInfo
);

router.patch(
  "/users/:userId/status",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.updateUserStatus
);

router.patch(
  "/users/:userId",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.activeUser,
);

router.delete(
  "/users/:userId",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.hardDeleteUser,
);

router.post(
  "/admins",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.createAdmin
);

router.get(
  "/admins",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.getAdminList
);

router.delete(
  "/admins/:adminId",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.deleteAdmin
);

router.patch(
  "/admins/:adminId",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.updateAdmin
);

// GET all plans (admin)
router.get(
  "/plans",
  checkAuthMiddleware(...Object.values(Role)),
  AdminController.getAllPlans
);

router.patch(
  "/plans/toggle/:planId",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.togglePlanStatus
);

router.patch(
  "/plans/:planId",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.updatePlan
);

router.delete(
  "/plans/:planId",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.deletePlan
);

router.post(
  "/plans",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.createPlan
);

router.get(
  "/offers",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.getAllOffers
);

router.post(
  "/offers",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.createOffer
);

router.patch(
  "/offers/toggle/:offerId",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.toggleOfferStatus
);

router.delete(
  "/offers/:offerId",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.deleteOffer
);

router.put(
  "/offers/:offerId",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.updateOffer
);

router.post(
  "/faqs",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.createFaq
);

router.put(
  "/faqs/:faqId",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.updateFaq
);

router.delete(
  "/faqs/:faqId",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.deleteFaq
);

router.get(
  "/faqs",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.getAllFaqs
);

router.get(
  "/faqs/by-category",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.getFaqsByCategory
);
router.get(
  "/faqs/public",
  AdminController.getAllFaqs
);

router.get(
  "/faqs/by-category/public",
  AdminController.getFaqsByCategory
);

router.get(
  "/dashboard/overview",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.getDashboardOverview
);

router.get(
  "/dashboard/sales-track",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.getSalesTrack
);

router.get(
  "/analytics/revenue",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.getRevenueAnalytics
);

router.get(
  "/analytics/overview",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  AdminController.getAnalyticsOverview
);

export const AdminRoutes = router;

// src/app/modules/subscription/subscriptionStudent.routes.js

import express from "express";
import { SubscriptionStudentController } from "./subscriptionStudent.controller.js";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";
import { Role } from "../../utils/role.js";

const router = express.Router();

// 🔐 All routes require authentication
// router.use(checkAuthMiddleware(...Object.values(Role)));

// Get All Subscription
router.get("/all-plan", SubscriptionStudentController.getAllPlans);
// Get current user's subscriptions
router.get(
  "/me",
  checkAuthMiddleware(...Object.values(Role)),
  SubscriptionStudentController.getMySubscription,
);

// Get single subscription
router.get("/:id", SubscriptionStudentController.getSubscriptionById);

// Purchase or upgrade subscription (ADMIN ONLY)
router.post(
  "/purchase",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  SubscriptionStudentController.purchaseSubscription,
);

// Toggle plan status (ACTIVE/INACTIVE)
router.patch(
  "/toggle-status/:id",
  checkAuthMiddleware(...Object.values(Role)),
  SubscriptionStudentController.toggleSubscriptionStatus,
);

// Cancel subscription
router.patch(
  "/cancel/:id",
  checkAuthMiddleware(...Object.values(Role)),
  SubscriptionStudentController.cancelSubscription,
);

export const SubscriptionStudentRouter = router;

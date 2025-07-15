import { Router } from "express";
import { paymentController } from "./payment.controller.js";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";
import { Role } from "../../utils/role.js";

const router = Router();

router.post("/webhook", paymentController.handleSamcartWebhook);
router.get(
  "/verify",
  checkAuthMiddleware(Role.STUDENT, Role.ADMIN, Role.OWNER),
  paymentController.verifyPayment,
);
router.post("/checkout/:planKey", paymentController.initiatePurchase);

router.get(
  "/checkout/:planKey",
  checkAuthMiddleware(Role.STUDENT, Role.ADMIN, Role.OWNER),
  paymentController.initiatePurchasefor_get,
);

export const PaymentRoutes = router;

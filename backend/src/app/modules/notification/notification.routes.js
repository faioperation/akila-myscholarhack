import { Router } from "express";
import {
  getMyNotifications,
  markAsRead,
  removeNotification,
} from "./notification.controller.js";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";

const router = Router();

// ADMIN + OWNER
router.get("/admin", checkAuthMiddleware("ADMIN", "OWNER"), getMyNotifications);

router.patch(
  "/admin/:recipientId/read",
  checkAuthMiddleware("ADMIN", "OWNER"),
  markAsRead,
);

router.delete(
  "/admin/:recipientId",
  checkAuthMiddleware("ADMIN", "OWNER"),
  removeNotification,
);

// STUDENT
router.get("/student", checkAuthMiddleware("STUDENT"), getMyNotifications);

router.patch(
  "/student/:recipientId/read",
  checkAuthMiddleware("STUDENT"),
  markAsRead,
);

router.delete(
  "/student/:recipientId",
  checkAuthMiddleware("STUDENT"),
  removeNotification,
);

export const NotificationRoutes = router;

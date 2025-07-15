import express from "express";

import { SettingsController } from "../settings/settings.controller.js";
import { Role } from "../../../utils/role.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = express.Router();

router.get(
  "/",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  SettingsController.getSettings,
);

router.patch(
  "/",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  SettingsController.updateSettings,
);

export const SettingsRoutes = router;

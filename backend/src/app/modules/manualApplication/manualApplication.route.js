import express from "express";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";
import { Role } from "../../utils/role.js";
import { ManualApplicationController } from "./manualApplication.controller.js";

const router = express.Router();

router.post(
  "/",
  checkAuthMiddleware(Role.STUDENT),
  ManualApplicationController.createManualApplication
);

router.get(
  "/",
  checkAuthMiddleware(...Object.values(Role)),
  ManualApplicationController.getAllManualApplications
);

router.get(
  "/:id",
  checkAuthMiddleware(...Object.values(Role)),
  ManualApplicationController.getManualApplicationById
);

router.patch(
  "/:id",
  checkAuthMiddleware(...Object.values(Role)),
  ManualApplicationController.updateManualApplication
);

router.delete(
  "/:id",
  checkAuthMiddleware(...Object.values(Role)),
  ManualApplicationController.deleteManualApplication
);

export const ManualApplicationRoutes = router;

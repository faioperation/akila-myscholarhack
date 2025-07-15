import express from "express";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";
import { Role } from "../../utils/role.js";
import { ApplicationController } from "./application.controller.js";


const router = express.Router();

// Create application (Save / Apply)
router.post(
  "/save",
  checkAuthMiddleware(Role.STUDENT),
  ApplicationController.createApplication
);

// Get logged-in user's applications
router.get(
  "/",
  checkAuthMiddleware(Role.STUDENT),
  ApplicationController.getMyApplications
);

// Get single application
router.get(
  "/:id",
  checkAuthMiddleware(Role.STUDENT),
  ApplicationController.getSingleApplication
);

// Update application status
router.patch(
  "/status/:id",
  checkAuthMiddleware(Role.STUDENT),
  ApplicationController.updateApplicationStatus
);

export const ApplicationRoute = router;

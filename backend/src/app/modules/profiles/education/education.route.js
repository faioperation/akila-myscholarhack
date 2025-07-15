import express from "express";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { EducationController } from './education.controller.js'
import { Role } from "../../../utils/role.js";

const router = express.Router();

// Create education
router.post(
  "/upsert",
  checkAuthMiddleware(...Object.values(Role)),
  EducationController.createEducation
);

// Get my educations
router.get(
  "/",
  checkAuthMiddleware(),
  EducationController.getMyEducations
);

// Delete education
router.delete(
  "/:id",
  checkAuthMiddleware(),
  EducationController.deleteEducation
);

export const EducationRoutes = router;

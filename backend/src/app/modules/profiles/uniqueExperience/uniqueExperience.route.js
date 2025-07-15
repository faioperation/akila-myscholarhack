import express from "express";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import { UniqueExperienceController } from "./uniqueExperience.controller.js";

const router = express.Router();

router.get(
  "/",
  checkAuthMiddleware(Role.STUDENT),
 UniqueExperienceController.getUniqueExperience
);

router.post(
  "/upsert",
  checkAuthMiddleware(Role.STUDENT),
  UniqueExperienceController.saveUniqueExperience
);

export const UniqueExperienceRoutes = router;

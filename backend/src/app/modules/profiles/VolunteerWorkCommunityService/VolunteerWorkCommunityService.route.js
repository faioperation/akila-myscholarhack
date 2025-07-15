import express from "express";
import { VolunteerController } from "./VolunteerWorkCommunityService.controller.js";
import { Role } from "../../../utils/role.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = express.Router();

router.get(
  "/",
  checkAuthMiddleware(Role.STUDENT),
  VolunteerController.getVolunteer
);

router.post(
  "/upsert",
  checkAuthMiddleware(Role.STUDENT),
  VolunteerController.saveVolunteer
);

export const VolunteerRoutes = router;

import express from "express";
import { ExtracurricularActivityController } from "./extraCurricularActivities.controller.js";
import { Role } from "../../../utils/role.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = express.Router();

router.get(
  "/",
  checkAuthMiddleware(Role.STUDENT),
  ExtracurricularActivityController.getExtracurricularActivity
);

router.post(
  "/upsert",
  checkAuthMiddleware(Role.STUDENT),
  ExtracurricularActivityController.saveExtracurricularActivity
);

export const ExtracurricularActivityRoutes = router;

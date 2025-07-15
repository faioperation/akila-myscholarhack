import express from "express";
import { ScholarshipSpecificInfoController } from "./scholarshipSpecificInfo.controller.js";
import { Role } from "../../../utils/role.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = express.Router();

router.get(
  "/",
  checkAuthMiddleware(Role.STUDENT),
  ScholarshipSpecificInfoController.getScholarshipSpecificInfo
);

router.post(
  "/upsert",
  checkAuthMiddleware(Role.STUDENT),
  ScholarshipSpecificInfoController.saveScholarshipSpecificInfo
);

export const ScholarshipSpecificInfoRoutes = router;

import express from "express";
import { Role } from "../../../utils/role.js";
import { AcademicInterestController } from "./academicInterest.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = express.Router();

router.get(
  "/",
  checkAuthMiddleware(Role.STUDENT),
  AcademicInterestController.getAcademicInterest
);

router.post(
  "/upsert",
  checkAuthMiddleware(Role.STUDENT),
  AcademicInterestController.saveAcademicInterest
);

export const AcademicInterestRoutes = router;

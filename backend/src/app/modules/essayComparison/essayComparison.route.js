import express from "express";
import { Role } from "../../utils/role.js";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";
import { EssayComparisonController } from "./essayComparison.controller.js";


const router = express.Router();

router.post(
  "/compare",
  checkAuthMiddleware(Role.STUDENT),
  EssayComparisonController.compareEssays
);

router.get(
  "/",
  checkAuthMiddleware(Role.STUDENT),
  EssayComparisonController.getComparisonHistory
);

router.get(
  "/:id",
  checkAuthMiddleware(Role.STUDENT),
  EssayComparisonController.getComparisonById
);

export const EssayComparisonRoutes = router;

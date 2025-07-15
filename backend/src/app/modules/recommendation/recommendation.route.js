import express from "express";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";
import { Role } from "../../utils/role.js";
import { RecommendationController } from "./recommendation.controller.js";

import { upload } from "../../utils/fileUpload.js";
const router = express.Router();

router.post(
  "/generate",
  checkAuthMiddleware(Role.STUDENT),
  RecommendationController.generateRecommendations
);

router.get(
  "/",
  checkAuthMiddleware(Role.STUDENT),
  RecommendationController.getUserRecommendations
);

router.get(
  "/all",
  checkAuthMiddleware(...Object.values(Role)),
  RecommendationController.getAllRecommendations
);

router.get(
  "/scholarships",
  checkAuthMiddleware(...Object.values(Role)),
  RecommendationController.getScholarships
);
router.get(
  "/scholarships/all/for-ai",
  RecommendationController.getScholarships
);

router.get(
  "/user/:userId",
  checkAuthMiddleware(...Object.values(Role)),
  RecommendationController.getRecommendationByUserId
);

router.post(
  "/sync-scholarships",
  RecommendationController.syncScholarships
);

router.patch(
  "/scholarships/update/:id",
  checkAuthMiddleware(Role.ADMIN, Role.OWNER),
  upload.array("images"),
  RecommendationController.updateScholarship
);

export const RecommendationRoutes = router;

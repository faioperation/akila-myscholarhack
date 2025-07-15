import { Router } from "express";
import { StudentReviewController } from "./studentReview.controller.js";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";
import { Role } from "../../utils/role.js";

const router = Router();

router.post("/create-review", checkAuthMiddleware(...Object.values(Role)), StudentReviewController.createReview);
router.get("/", StudentReviewController.getAllReviews);
router.get("/:id", StudentReviewController.getSingleReview);
router.patch("/:id", checkAuthMiddleware(...Object.values(Role)), StudentReviewController.updateReview);
router.delete("/:id", checkAuthMiddleware(...Object.values(Role)), StudentReviewController.deleteReview);

export const StudentReviewRoutes = router;
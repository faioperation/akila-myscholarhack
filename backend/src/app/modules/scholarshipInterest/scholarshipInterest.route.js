import express from "express";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";
import { Role } from "../../utils/role.js";
import { ScholarshipInterestController } from "./scholarshipInterest.controller.js";


const router = express.Router();

router.post(
    "/",
    checkAuthMiddleware(...Object.values(Role)),
    ScholarshipInterestController.upsertScholarshipInterest
);

router.get(
    "/:userProfileId",
    checkAuthMiddleware(...Object.values(Role)),
    ScholarshipInterestController.getScholarshipInterest
);

export const ScholarshipInterestRoutes = router;

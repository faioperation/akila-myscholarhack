import express from "express";

import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";
import { Role } from "../../utils/role.js";
import { DashboardStatsController } from "./dashboardStats.controller.js";


const router = express.Router();

router.get(
    "/",
    checkAuthMiddleware(...Object.values(Role)),
    DashboardStatsController.getDashboardStats
);

export const DashboardStatsRoutes = router;

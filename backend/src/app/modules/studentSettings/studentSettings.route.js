import { Router } from "express";
import { StudentSettingsController } from "./studentSettings.controller.js";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";
import { Role } from "../../utils/role.js";

const router = Router();

router.get("/", checkAuthMiddleware(Role.STUDENT), StudentSettingsController.getStudentSettings);
router.post("/upsert", checkAuthMiddleware(Role.STUDENT), StudentSettingsController.upsertStudentSettings);

export const StudentSettingsRoutes = router;

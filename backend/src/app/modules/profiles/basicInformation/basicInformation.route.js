import express from "express";
import { BasicInformationController } from "./basicInformation.controller.js";
import { Role } from "../../../utils/role.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = express.Router();

router.get(
  "/",
  checkAuthMiddleware(Role.STUDENT),
  BasicInformationController.getBasicInformation
);

router.post(
  "/upsert",
  checkAuthMiddleware(Role.STUDENT),
  BasicInformationController.saveBasicInformation
);

export const BasicInformationRoutes = router;

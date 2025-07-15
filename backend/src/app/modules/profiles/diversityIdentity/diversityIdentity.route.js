import express from "express";
import { DiversityIdentityController } from "./diversityIdentity.controller.js";
import { Role } from "../../../utils/role.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = express.Router();

router.get(
  "/",
  checkAuthMiddleware(Role.STUDENT),
  DiversityIdentityController.getDiversityIdentity
);

router.post(
  "/upsert",
  checkAuthMiddleware(Role.STUDENT),
  DiversityIdentityController.saveDiversityIdentity
);

export const DiversityIdentityRoutes = router;

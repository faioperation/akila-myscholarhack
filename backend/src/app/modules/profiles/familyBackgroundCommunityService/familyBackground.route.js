import express from "express";
import { FamilyBackgroundController } from "./familyBackground.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";


const router = express.Router();

router.get(
  "/",
  checkAuthMiddleware(Role.STUDENT),
  FamilyBackgroundController.getFamilyBackground
);

router.post(
  "/upsert",
  checkAuthMiddleware(Role.STUDENT),
  FamilyBackgroundController.saveFamilyBackground
);

export const FamilyBackgroundRoutes = router;

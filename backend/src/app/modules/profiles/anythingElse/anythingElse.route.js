
import express from "express";
import { AnythingElseController } from "./anythingElse.controller.js";
import { Role } from "../../../utils/role.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = express.Router();

router.get(
  "/",
  checkAuthMiddleware(Role.STUDENT),
  AnythingElseController.getAnythingElse
);

router.post(
  "/upsert",
  checkAuthMiddleware(Role.STUDENT),
  AnythingElseController.saveAnythingElse
);

export const AnythingElseRoutes = router;

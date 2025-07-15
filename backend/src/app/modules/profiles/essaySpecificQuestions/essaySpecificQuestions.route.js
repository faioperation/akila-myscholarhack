import express from "express";
import { EssaySpecificQuestionsController } from "./essaySpecificQuestions.controller.js";
import { Role } from "../../../utils/role.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = express.Router();

router.get(
  "/",
  checkAuthMiddleware(Role.STUDENT),
  EssaySpecificQuestionsController.getEssaySpecificQuestions
);

router.post(
  "/upsert",
  checkAuthMiddleware(Role.STUDENT),
  EssaySpecificQuestionsController.saveEssaySpecificQuestions
);

export const EssaySpecificQuestionsRoutes = router;

import express from "express";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";
import { Role } from "../../utils/role.js";
import { EssayController } from "./generateEssay.controller.js";
import { upload } from "../../utils/fileUpload.js";

const router = express.Router();

router.get("/", checkAuthMiddleware(Role.STUDENT), EssayController.getEssays);

router.get(
  "/:id",
  checkAuthMiddleware(Role.STUDENT),
  EssayController.getEssayById,
);

router.post(
  "/generate",
  checkAuthMiddleware(Role.STUDENT),
  upload.fields([
    { name: "voice", maxCount: 1 },
    { name: "audio", maxCount: 1 },
    { name: "documents", maxCount: 5 },
    { name: "document", maxCount: 5 },
    { name: "file", maxCount: 5 },
  ]),
  EssayController.createEssay,
);

// EDIT essay anytime
router.patch(
  "/update/:id",
  checkAuthMiddleware(Role.STUDENT),
  EssayController.updateEssayContent,
);

// SAVE essay
router.patch(
  "/save/:id",
  checkAuthMiddleware(Role.STUDENT),
  EssayController.saveEssay,
);

router.delete(
  "/delete/:id",
  checkAuthMiddleware(Role.STUDENT),
  EssayController.deleteEssay,
);

export const GenerateEssayRoutes = router;

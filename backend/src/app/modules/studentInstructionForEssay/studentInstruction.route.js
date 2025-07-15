import { Router } from "express";
import { StudentInstructionController } from "./studentInstruction.controller.js";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";
import { Role } from "../../utils/role.js";

const router = Router();

router.post(
  "/",
  checkAuthMiddleware(Role.ADMIN),
  StudentInstructionController.createStudentInstruction
);

router.get(
  "/",
  checkAuthMiddleware(Role.STUDENT, Role.ADMIN, Role.OWNER),
  StudentInstructionController.getStudentInstruction
);

export const StudentInstructionRoutes = router;

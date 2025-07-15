import express from "express";
import { ProfileController } from "./profile.controller.js";
import { Role } from "../../../utils/role.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { uploadProfilePic } from "../../../config/multerProfileUpload.js";

const router = express.Router();

router.post("/upsert", checkAuthMiddleware(...Object.values(Role)), uploadProfilePic.single("profilePicture"), ProfileController.upsertUserProfile);

router.get("/me", checkAuthMiddleware(...Object.values(Role)), ProfileController.getProfileMe);

export const ProfileRoutes = router;

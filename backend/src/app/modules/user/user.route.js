import express from "express";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";
import { Role } from "../../utils/role.js";
import { UserController } from "./user.controller.js";

const router = express.Router();

router.post("/register", UserController.registerUser);
router.get(
  "/me",
  checkAuthMiddleware(...Object.values(Role)),
  UserController.getUserInfo
);

// router.get("/profile", checkAuthMiddleware(...Object.values(Role)) , UserController.getUserProfile);

router.get(
  "/user-details/:id",
  checkAuthMiddleware(...Object.values(Role)),
  UserController.userDetails
);

// all user profile public

router.get("/all", checkAuthMiddleware(...Object.values(Role)),
  UserController.getAllUsersWithProfile);


router.get("/all/get37264", UserController.getAllUsersWithProfile);

router.post(
  "/update-user",
  checkAuthMiddleware(...Object.values(Role)),
  UserController.updateUser
);

export const UserRoutes = router;

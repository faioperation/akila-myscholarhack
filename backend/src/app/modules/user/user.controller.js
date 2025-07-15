import { createUserService, UserService } from "./user.service.js";
import { createNotificationForAdmins } from "../notification/notification.service.js";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse.js";
import DevBuildError from "../../lib/DevBuildError.js";

const registerUser = async (req, res, next) => {
  try {
    const picture = req.file?.path || null;
    const prisma = req.app.get("prisma");
    const payload = {
      prisma,
      ...req.body,
      picture,
    };

    const result = await createUserService(payload);

    // 🔔 Admin Notification Hook
    try {
      await createNotificationForAdmins({
        title: "New User Registered",
        message: `${result.email} has registered`,
        type: "USER_REGISTER",
      });
    } catch (notifyError) {
      console.error(
        "⚠️ Failed to send admin notification:",
        notifyError.message,
      );
    }

    sendResponse(res, {
      success: true,
      message: "User created successfully",
      statusCode: StatusCodes.CREATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getUserInfo = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.params.id || req.user.id;

    const user = await UserService.findUserInfoById(prisma, userId);

    if (!user) {
      throw new DevBuildError("User not found", 404);
    }

    // Flattening the response for the frontend
    const responseData = {
      id: user.id,
      email: user.email,
      fullName: user.profile?.fullName || user.studentSettings?.fullName || user.name,
      profilePicture: user.profile?.profilePicture || user.picture,
      filePath: user.profile?.filePath,
      profileUrl: user.profile?.profileUrl,
      phone: user.phoneNumber,
      isPlan: user.isPlan,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

// User details by ID
const userDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const prisma = req.prisma; // already injected middleware দিয়ে

    const user = await UserService.findByIdWithProfile(prisma, id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsersWithProfile = async (req, res) => {
  try {
    const prisma = req.prisma;

    const users = await UserService.findAllWithProfile(prisma);

    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("getAllUsersWithProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const prisma = req.prisma;

    const { userId, ...data } = req.body;
    const id = userId || req.user?.id;

    if (!id) {
      return res.status(400).json({ message: "userId required" });
    }

    const updatedUser = await UserService.update(prisma, id, data);

    return res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("updateUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

export const UserController = {
  registerUser,
  userDetails,
  getAllUsersWithProfile,
  updateUser,
  getUserInfo,
};

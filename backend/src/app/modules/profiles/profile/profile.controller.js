import fs from "fs";
import path from "path";
import { ProfileService } from "./profile.service.js";
import { UserService } from "../../user/user.service.js";

const upsertUserProfile = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user?.id || req.body.userId;
    const user = req.user;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId required",
      });
    }

    const { userId: _, ...data } = req.body;

    // 📸 Handle uploaded file
    if (req.file) {
      data.profilePicture = req.file.filename;

      // ✅ OS-safe, DB-safe path (ALWAYS use /)
      data.filePath = `uploads/profile/${req.file.filename}`;
    }

    // 🔍 Check existing profile
    const oldProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    // 👤 fullName is REQUIRED in schema → only set on CREATE
    if (!oldProfile && !data.fullName) {
      data.fullName = user?.name || "User";
    }

    // 🧹 Remove undefined fields (VERY IMPORTANT)
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    // 🔢 Parse numerical fields
    if (data.gpa) {
      data.gpa = parseFloat(data.gpa);
    }

    // 💾 UPSERT Profile
    const profile = await ProfileService.upsertByUserId(
      prisma,
      userId,
      data
    );

    // 🔄 Sync to User and StudentSettings if fullName, profilePicture, filePath or profileUrl changed
    if (data.fullName || data.profilePicture || data.filePath || data.profileUrl) {
      await UserService.update(prisma, userId, {
        name: data.fullName,
        picture: data.profilePicture,
        filePath: data.filePath,
        profileUrl: data.profileUrl,
      });
    }

    // 🗑️ Delete old file AFTER successful DB save
    if (oldProfile?.filePath && req.file) {
      const oldFileAbsolutePath = path.resolve(oldProfile.filePath);
      fs.unlink(oldFileAbsolutePath, () => { });
    }

    return res.json({
      success: true,
      message: "User profile saved successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export default upsertUserProfile;


const getProfileMe = async (req, res) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;

    const profile = await ProfileService.findByUserId(prisma, userId);

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const ProfileController = { upsertUserProfile, getProfileMe };

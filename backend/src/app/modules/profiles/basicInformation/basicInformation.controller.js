import { StatusCodes } from "http-status-codes";
import { BasicInformationService } from "./basicInformation.service.js";
import { UserService } from "../../user/user.service.js";

const getBasicInformation = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User profile not found",
      });
    }

    const data =
      await BasicInformationService.getByProfileId(
        prisma,
        profile.id
      );

    res.status(StatusCodes.OK).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const saveBasicInformation = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User profile not found",
      });
    }

    const data = { ...req.body };
    if (data.gpa) {
      data.gpa = parseFloat(data.gpa);
    }

    const result =
      await BasicInformationService.upsert(
        prisma,
        profile.id,
        data
      );

    // 🔄 Sync fullName, filePath, and profileUrl to User, UserProfile, and StudentSettings
    if (data.fullName || data.filePath || data.profileUrl) {
      await UserService.update(prisma, userId, {
        name: data.fullName,
        filePath: data.filePath,
        profileUrl: data.profileUrl,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Basic information saved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const BasicInformationController = {
  getBasicInformation,
  saveBasicInformation,
};

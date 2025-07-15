import { StatusCodes } from "http-status-codes";
import { UniqueExperienceService } from "./uniqueExperience.service.js";

const getUniqueExperience = async (req, res, next) => {
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
      await UniqueExperienceService.getByProfileId(
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

const saveUniqueExperience = async (req, res, next) => {
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

    const result =
      await UniqueExperienceService.upsert(
        prisma,
        profile.id,
        req.body
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Unique experience saved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const UniqueExperienceController = {
  getUniqueExperience,
  saveUniqueExperience,
};

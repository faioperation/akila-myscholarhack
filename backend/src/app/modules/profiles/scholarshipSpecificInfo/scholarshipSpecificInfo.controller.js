import { StatusCodes } from "http-status-codes";
import { ScholarshipSpecificInfoService } from "./scholarshipSpecificInfo.service.js";

const getScholarshipSpecificInfo = async (req, res, next) => {
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
      await ScholarshipSpecificInfoService.getByProfileId(
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

const saveScholarshipSpecificInfo = async (req, res, next) => {
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
      await ScholarshipSpecificInfoService.upsert(
        prisma,
        profile.id,
        req.body
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Scholarship specific info saved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ScholarshipSpecificInfoController = {
  getScholarshipSpecificInfo,
  saveScholarshipSpecificInfo,
};

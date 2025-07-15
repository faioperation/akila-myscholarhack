import { StatusCodes } from "http-status-codes";
import { DiversityIdentityService } from "./diversityIdentity.service.js";

const getDiversityIdentity = async (req, res, next) => {
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
      await DiversityIdentityService.getByProfileId(
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

const saveDiversityIdentity = async (req, res, next) => {
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
      await DiversityIdentityService.upsert(
        prisma,
        profile.id,
        req.body
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Diversity & identity saved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const DiversityIdentityController = {
  getDiversityIdentity,
  saveDiversityIdentity,
};

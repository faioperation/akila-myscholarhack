import { StatusCodes } from "http-status-codes";
import { ExtracurricularActivityService } from "./extraCurricularActivities.service.js";

const getExtracurricularActivity = async (req, res, next) => {
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
      await ExtracurricularActivityService.getByProfileId(
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

const saveExtracurricularActivity = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;
    const { activityName, yearsInvolved, leadership } = req.body;

    if (!activityName || !yearsInvolved) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Activity name and years involved are required",
      });
    }

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
      await ExtracurricularActivityService.upsert(
        prisma,
        profile.id,
        { activityName, yearsInvolved, leadership }
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Extracurricular activity saved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ExtracurricularActivityController = {
  getExtracurricularActivity,
  saveExtracurricularActivity,
};

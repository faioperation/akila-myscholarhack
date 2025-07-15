import { StatusCodes } from "http-status-codes";
import { AcademicInterestService } from "./academicInterest.service.js";

const getAcademicInterest = async (req, res, next) => {
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
      await AcademicInterestService.getByProfileId(
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

const saveAcademicInterest = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;
    const { intendedMajor, whyThisField, careerGoals } = req.body;

    if (!intendedMajor || !whyThisField || !careerGoals) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "All fields are required",
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
      await AcademicInterestService.upsert(
        prisma,
        profile.id,
        { intendedMajor, whyThisField, careerGoals }
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Academic interest saved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const AcademicInterestController = {
  getAcademicInterest,
  saveAcademicInterest,
};

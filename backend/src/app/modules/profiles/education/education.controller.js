import * as EducationService from "./education.service.js";
import { StatusCodes } from "http-status-codes";

const createEducation = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const prisma = req.prisma;

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User profile not found",
      });
    }

    const education = await EducationService.createEducation(
      profile.id,
      req.body
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: education,
    });
  } catch (error) {
    next(error);
  }
};

const getMyEducations = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const prisma = req.prisma;

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User profile not found",
      });
    }

    const educations = await EducationService.getEducationsByProfile(
      profile.id
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: educations,
    });
  } catch (error) {
    next(error);
  }
};

const deleteEducation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;
    const prisma = req.prisma;

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User profile not found",
      });
    }

    await EducationService.deleteEducation(id, profile.id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Education deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const EducationController = {
  createEducation,
  getMyEducations,
  deleteEducation,
};

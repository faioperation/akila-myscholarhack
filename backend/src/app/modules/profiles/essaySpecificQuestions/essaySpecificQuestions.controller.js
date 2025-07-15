import { StatusCodes } from "http-status-codes";
import { EssaySpecificQuestionsService } from "./essaySpecificQuestions.service.js";

const getEssaySpecificQuestions = async (req, res, next) => {
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
      await EssaySpecificQuestionsService.getByProfileId(
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

const saveEssaySpecificQuestions = async (req, res, next) => {
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
      await EssaySpecificQuestionsService.upsert(
        prisma,
        profile.id,
        req.body
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Essay specific questions saved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const EssaySpecificQuestionsController = {
  getEssaySpecificQuestions,
  saveEssaySpecificQuestions,
};

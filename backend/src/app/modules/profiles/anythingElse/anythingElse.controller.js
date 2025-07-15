import { StatusCodes } from "http-status-codes";
import { AnythingElseService } from "./anythingElse.service.js";

const getAnythingElse = async (req, res, next) => {
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
      await AnythingElseService.getByProfileId(
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

const saveAnythingElse = async (req, res, next) => {
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
      await AnythingElseService.upsert(
        prisma,
        profile.id,
        req.body
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Anything else saved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const AnythingElseController = {
  getAnythingElse,
  saveAnythingElse,
};

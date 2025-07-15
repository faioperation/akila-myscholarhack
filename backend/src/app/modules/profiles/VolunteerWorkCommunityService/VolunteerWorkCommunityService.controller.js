import { StatusCodes } from "http-status-codes";
import { VolunteerService } from "./VolunteerWorkCommunityService.service.js";

const getVolunteer = async (req, res, next) => {
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

    const data = await VolunteerService.getByProfileId(
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

const saveVolunteer = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;

    const {
      whatVolunteerWork,
      organization,
      totalHours,
    } = req.body;

    if (!organization || totalHours === undefined) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Organization and total hours are required",
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

    const result = await VolunteerService.upsert(
      prisma,
      profile.id,
      {
        organization,
        totalHours: Number(totalHours),
        whatVolunteerWork,
      }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Volunteer work saved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const VolunteerController = {
  getVolunteer,
  saveVolunteer,
};

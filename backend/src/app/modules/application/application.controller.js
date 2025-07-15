import { StatusCodes } from "http-status-codes";
import { ApplicationService } from "./application.service.js";

// CREATE application
const createApplication = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;
    const { essayId, scholarshipId } = req.body;

    const result = await ApplicationService.createApplication(
      res,
      prisma,
      userId,
      essayId,
      scholarshipId
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Application created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET logged-in user's applications

const getMyApplications = async (req, res, next) => {
  try {
    const prisma = req.prisma;
  const userId = req.user.id;

    // 🔥 pass req.query
    const result = await ApplicationService.getByUserId(
      prisma,
      userId,
      req.query
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};


// UPDATE application status
const updateApplicationStatus = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const result = await ApplicationService.updateStatus(
      prisma,
      id,
      userId,
      status
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Application status updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET single application
const getSingleApplication = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;
    const { id } = req.params;

    const result = await ApplicationService.getById(prisma, id, userId);

    if (!result) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ApplicationController = {
  createApplication,
  getMyApplications,
  getSingleApplication,
  updateApplicationStatus,
};

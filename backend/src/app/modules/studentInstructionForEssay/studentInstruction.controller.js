import { StatusCodes } from "http-status-codes";
import { StudentInstructionService } from "./studentInstruction.service.js";

const createStudentInstruction = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;
    const data = { ...req.body, userId };

    const result = await StudentInstructionService.create(prisma, data);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Student instruction saved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getStudentInstruction = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const result = await StudentInstructionService.getSingle(prisma);

    if (!result) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Student instruction not found",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Student instruction fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const StudentInstructionController = {
  createStudentInstruction,
  getStudentInstruction,
};

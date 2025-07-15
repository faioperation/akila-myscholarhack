import { StatusCodes } from "http-status-codes";
import { EssayComparisonService } from "./essayComparison.service.js";

const compareEssays = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;
    const profileId = req.user.userProfileId;
    const { essayAId, essayBId } = req.body;

    if (!essayAId || !essayBId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Both essay IDs are required",
      });
    }

    if (essayAId === essayBId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Cannot compare the same essay",
      });
    }

    // FETCH ESSAYS (ownership check)

    const essays = await prisma.essay.findMany({
      where: {
        id: { in: [essayAId, essayBId] },
        userId,
        status: { in: ["SAVED", "EDITED"] },
      },
    });

    if (essays.length !== 2) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "One or both essays not found",
      });
    }

    const essayA = essays.find((e) => e.id === essayAId);
    const essayB = essays.find((e) => e.id === essayBId);

    if (essayA.subject.toLowerCase() !== essayB.subject.toLowerCase()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message:
          "Subject did not match. Please give same subject essay to compare.",
      });
    }

    // CALL AI

    const aiResult = await EssayComparisonService.compareEssaysByAI(
      essayA.contentFinal,
      essayB.contentFinal,
    );

    // SAVE RESULT

    const savedResult = await EssayComparisonService.create(prisma, {
      userId,
      userProfileId: profileId,
      essayAId,
      essayBId,

      scoreA: aiResult.essayA.score,
      strengthsA: aiResult.essayA.strengths,
      improvementsA: aiResult.essayA.improvements,

      scoreB: aiResult.essayB.score,
      strengthsB: aiResult.essayB.strengths,
      improvementsB: aiResult.essayB.improvements,

      winner: aiResult.comparison.winner,
      percentageDiff: aiResult.comparison.percentage,
      reason: aiResult.comparison.reason,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Essay comparison completed",
      data: savedResult,
    });
  } catch (error) {
    next(error);
  }
};

const getComparisonHistory = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;

    const data = await EssayComparisonService.getByUserId(prisma, userId);

    res.status(StatusCodes.OK).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getComparisonById = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;
    const { id } = req.params;

    const data = await EssayComparisonService.getById(prisma, id, userId);

    if (!data) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Comparison not found",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const EssayComparisonController = {
  compareEssays,
  getComparisonHistory,
  getComparisonById,
};

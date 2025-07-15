import { StatusCodes } from "http-status-codes"
import { RecommendationService } from "./recommendation.service.js"
import { envVars } from "../../config/env.js";

const generateRecommendations = async (req, res, next) => {
  try {
    const prisma = req.prisma
    const userId = req.user.id

    // CALL AI SERVICE
    const aiResponse =
      await RecommendationService.getRecommendationsFromAI(userId)

    const aiResults = aiResponse?.data
    console.log('ai results', aiResults)
    if (!Array.isArray(aiResults)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid AI recommendation response",
      })
    }

    const recommendationData = []

    // UPSERT SCHOLARSHIPS + PREPARE RECOMMENDATIONS
    for (const item of aiResults) {
      const deadlineDate = (() => {
        if (!item.deadline) return null;
        const d = new Date(item.deadline);
        return isNaN(d.getTime()) ? null : d;
      })();

      // 💰 Extract amount from title or provided field
      const amountFromTitle = item.title?.match(/\$(\d{1,3}(,\d{3})*)/)?.[1]?.replace(/,/g, "");
      const parsedAmount = amountFromTitle
        ? parseInt(amountFromTitle, 10)
        : (item.amount ? parseInt(String(item.amount).replace(/[^0-9]/g, ""), 10) : 0);

      const scholarship =
        await RecommendationService.upsertScholarship(prisma, {
          title: item.title ? item.title.replace(/"/g, "") : item.title,
          type: item.type || "General",
          amount: parsedAmount || 0,
          provider: item.from || item.provider || "AI_RECOMMENDATION",
          deadline: deadlineDate,
          subject: item.subject ?? null,
          description: item.description ?? "",
          images: item.images ?? [],
          detailUrl: item.detailUrl ?? null,
        })

      recommendationData.push({
        userId,
        scholarshipId: scholarship.id,
      })
    }

    // SAVE RECOMMENDATIONS
    if (recommendationData.length) {
      await RecommendationService.createMany(prisma, recommendationData)
    }

    // FETCH CREATED RECOMMENDATIONS WITH SCHOLARSHIP DATA (Only the ones just created)
    const scholarshipIds = recommendationData.map(r => r.scholarshipId);
    const result = await prisma.recommendation.findMany({
      where: {
        userId,
        scholarshipId: { in: scholarshipIds }
      },
      orderBy: { createdAt: 'desc' },
      take: recommendationData.length,
      select: {
        id: true,
        userId: true,
        scholarshipId: true,
        createdAt: true,
        scholarship: true,
      },
    })

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Recommendations generated successfully",
      data: result,
    })
  } catch (error) {
    next(error);
  }
};

const getUserRecommendations = async (req, res, next) => {
  try {
    const prisma = req.prisma
    const userId = req.user.id

    // ✅ PASS QUERY PARAMS TO SERVICE
    const result =
      await RecommendationService.getByUserId(
        prisma,
        userId,
        req.query
      )

    res.status(StatusCodes.OK).json({
      success: true,
      meta: result.meta,
      data: result.data,
    })
  } catch (error) {
    next(error)
  }
}

const getAllRecommendations = async (req, res, next) => {
  try {
    const prisma = req.prisma

    const result = await RecommendationService.getAll(
      prisma,
      req.query
    )

    res.status(StatusCodes.OK).json({
      success: true,
      meta: result.meta,
      data: result.data,
    })
  } catch (error) {
    next(error)
  }
}

const getRecommendationByUserId = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const { userId } = req.params;

    const result = await RecommendationService.getByUserId(
      prisma,
      userId,
      req.query
    );

    res.status(StatusCodes.OK).json({
      success: true,
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const getScholarships = async (req, res, next) => {
  try {
    const prisma = req.prisma;

    const result = await RecommendationService.getAllScholarships(
      prisma,
      req.query
    );

    res.status(StatusCodes.OK).json({
      success: true,
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const syncScholarships = async (req, res, next) => {
  try {
    const prisma = req.prisma;

    // 1. Trigger the sync and wait for results
    const syncResult = await RecommendationService.triggerScholarshipSync();
    console.log("📡 Sync trigger result from AI API:", JSON.stringify(syncResult).substring(0, 100) + "...");

    // 2. Save the received scholarships directly
    const saveResult = await RecommendationService.saveScholarships(prisma, syncResult);
    console.log(`💾 Saved ${saveResult.count} scholarships to DB`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Scholarships synchronized and saved successfully",
      count: saveResult.count,
    });
  } catch (error) {
    next(error);
  }
};

const updateScholarship = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const { id } = req.params;
    let data = { ...req.body };

    console.log(`[UpdateScholarship] Attempting to update ID: ${id}`);
    // console.log(`[UpdateScholarship] Body:`, data);

    // 🛡️ Pre-processing fields (especially for form-data)
    if (data.amount !== undefined) {
      data.amount = parseInt(String(data.amount).replace(/[^0-9]/g, ""), 10) || 0;
    }

    if (data.deadline !== undefined) {
      const d = new Date(data.deadline);
      data.deadline = isNaN(d.getTime()) ? null : d;
    }

    // Handle uploaded images
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const imageUrls = req.files.map(file => {
        return `${envVars.SERVER_URL}/uploads/images/${file.filename}`.replace(/([^:]\/)\/+/g, "$1");
      });

      let existingImages = [];
      if (data.images) {
        try {
          existingImages = typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
        } catch (e) {
          existingImages = Array.isArray(data.images) ? data.images : [data.images];
        }
      }

      data.images = [...existingImages, ...imageUrls];
    }

    // Ensure we don't try to update the ID itself if it's in the body
    delete data.id;

    const result = await RecommendationService.updateScholarship(prisma, id, data);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Scholarship updated successfully",
      data: result,
    });
  } catch (error) {
    // 🛡️ Handle Prisma "Record not found" error
    if (error.code === 'P2025') {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Scholarship not found with the provided ID",
      });
    }
    next(error);
  }
};


export const RecommendationController = {
  generateRecommendations,
  getUserRecommendations,
  getAllRecommendations,
  getRecommendationByUserId,
  getScholarships,
  syncScholarships,
  updateScholarship,
};


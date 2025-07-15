// ES MODULE ✅

import { StatusCodes } from "http-status-codes";
import { QueryBuilder } from "../../utils/QueryBuilder.js";

export const ApplicationService = {
  // CREATE application

  createApplication: async (res,prisma, userId, essayId, scholarshipId) => {
    // 1️⃣ Validate essay ownership
    const essay = await prisma.essay.findFirst({
      where: {
        id: essayId,
        userId,
        isDeleted: false,
      },
    });

    if (!essay) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Essay not found or not authorized",
        data: {},
      });
    }

    // 2️⃣ Validate scholarship
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
    });

    if (!scholarship) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Scholarship not found",
        data: {},
      });
    }

    // 3️⃣ Prevent duplicate application
    const existing = await prisma.application.findFirst({
      where: {
        userId,
        scholarshipId,
      },
    });

    if (existing) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: "Already applied to this scholarship",
        data: {},
      });
    }

    // 4️⃣ Create application with snapshots
    return prisma.application.create({
      data: {
        userId,
        essayId,
        scholarshipId,
        status: "PROCESSING", // Prisma enum ✅
        essayTitle: essay?.title || null,
        scholarshipTitle: scholarship.title,
        scholarshipAmount: scholarship.amount,
        scholarshipDeadline: scholarship.deadline,
      },
    });
  },

  // GET applications by user

  getByUserId: async (prisma, userId, query) => {
    const builder = new QueryBuilder(query)
      // 🔍 search on related fields
      .search([{ scholarship: ["title"] }, { essay: ["title"] }])
      // 🔎 filter on related models
      .filter("status", { scholarship: ["title"] })
      // ↕ sort (supports -createdAt, scholarship.from, etc.)
      .sort("-createdAt", {
        scholarship: ["deadline"],
      })
      .fields()
      .paginate();

    const prismaQuery = builder.build();

    // 🔐 scope to logged-in user
    prismaQuery.where = {
      ...(prismaQuery.where || {}),
      userId,
    };

    // 🔄 include relations (select/include-safe)
    if (prismaQuery.select) {
      prismaQuery.select.scholarship = {
        select: {
          title: true,
          amount: true,
          deadline: true,
        },
      };

      prismaQuery.select.essay = {
        select: {
          title: true,
        },
      };
    } else {
      prismaQuery.include = {
        scholarship: {
          select: {
            title: true,
            amount: true,
            deadline: true,
          },
        },
        essay: {
          select: {
            title: true,
          },
        },
      };
    }

    // 📦 fetch data
    const data = await prisma.application.findMany(prismaQuery);

    // 📊 total count (for pagination meta)
    const total = await prisma.application.count({
      where: prismaQuery.where,
    });

    return {
      data,
      meta: builder.getMeta(total),
    };
  },

  // UPDATE application status

  updateStatus: async (prisma, applicationId, userId, status) => {
    const result = await prisma.application.updateMany({
      where: {
        id: applicationId,
        userId,
      },
      data: { status },
    });

    if (result.count === 0) {
      const error = new Error("Application not found or not authorized");
      error.statusCode = 404;
      throw error;
    }

    return result;
  },

  // ===============================
  // GET single application
  // ===============================
  getById: async (prisma, applicationId, userId) => {
    return prisma.application.findFirst({
      where: {
        id: applicationId,
        userId,
      },
      include: {
        scholarship: true,
        essay: true,
      },
    });
  },
};

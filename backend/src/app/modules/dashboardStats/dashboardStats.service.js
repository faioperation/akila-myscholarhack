
import { ESSAY_STATUS } from "../generateEssay/generateEssay.constant.js";

const getStats = async (prisma, userId) => {
    const totalEssays = await prisma.essay.count({
        where: {
            userId,
            isDeleted: false,
            status: { in: [ESSAY_STATUS.SAVED, ESSAY_STATUS.EDITED] },
        },
    });

    const scholarshipAdded = await prisma.application.count({
        where: {
            userId,
        },
    });

    const manualScholarshipAdded = await prisma.manualApplication.count({
        where: {
            userId,
        },
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const threeDaysLater = new Date(startOfToday);
    threeDaysLater.setDate(startOfToday.getDate() + 4); // End of 3 days from today

    const upcomingDeadlineCount = await prisma.application.count({
        where: {
            userId,
            status: "PROCESSING",
            scholarship: {
                deadline: {
                    gte: startOfToday,
                    lt: threeDaysLater,
                },
            },
        },
    });

    const upcomingManualDeadlineCount = await prisma.manualApplication.count({
        where: {
            userId,
            status: "PROCESSING",
            deadline: {
                gte: startOfToday,
                lt: threeDaysLater,
            },
        },
    });

    const upcomingDeadline = await prisma.application.findFirst({
        where: {
            userId,
            status: "PROCESSING",
            scholarship: {
                deadline: {
                    gte: startOfToday,
                },
            },
        },
        orderBy: {
            scholarship: {
                deadline: "asc",
            },
        },
        select: {
            scholarshipTitle: true,
            scholarship: {
                select: {
                    deadline: true,
                },
            },
        },
    });

    const upcomingManualDeadline = await prisma.manualApplication.findFirst({
        where: {
            userId,
            status: "PROCESSING",
            deadline: {
                gte: startOfToday,
            },
        },
        orderBy: {
            deadline: "asc",
        },
        select: {
            title: true,
            deadline: true,
        },
    });

    // Determine the earliest deadline between regular and manual applications
    let finalUpcomingDeadline = upcomingDeadline;
    if (upcomingManualDeadline) {
        if (!upcomingDeadline || upcomingManualDeadline.deadline < upcomingDeadline.scholarship.deadline) {
            finalUpcomingDeadline = {
                scholarshipTitle: upcomingManualDeadline.title,
                scholarship: {
                    deadline: upcomingManualDeadline.deadline,
                },
            };
        }
    }

    const recommendations = await prisma.recommendation.findMany({
        where: { userId },
        include: {
            scholarship: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const essays = await prisma.essay.findMany({
        where: {
            userId,
            isDeleted: false,
            status: { in: [ESSAY_STATUS.SAVED, ESSAY_STATUS.EDITED] },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return {
        totalEssays,
        scholarshipAdded: scholarshipAdded + manualScholarshipAdded,
        totalRecommendations: recommendations.length,
        upcomingDeadline: finalUpcomingDeadline,
        upcomingDeadlineCount: upcomingDeadlineCount + upcomingManualDeadlineCount,
        essays,
        recommendations,
    };
};

export const DashboardStatsService = {
    getStats,
};

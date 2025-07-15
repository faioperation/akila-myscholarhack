import { StatusCodes } from "http-status-codes";
import { DashboardStatsService } from "./dashboardStats.service.js";

const getDashboardStats = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
          const prisma = req.prisma;

        const stats = await DashboardStatsService.getStats(prisma,userId);

        res.status(StatusCodes.OK).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};

export const DashboardStatsController = {
    getDashboardStats,
};

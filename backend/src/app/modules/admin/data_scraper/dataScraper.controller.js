import { DataScraperService } from "./dataScraper.service.js";

export const DataScraperController = {
  create: async (req, res, next) => {
    try {
      const result = await DataScraperService.create(req.prisma, req.body);

      return res.status(result.status).json({
        success: result.success,
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },

  getAll: async (req, res, next) => {
    try {
      const result = await DataScraperService.getAll(req.prisma);

      return res.status(result.status).json({
        success: result.success,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  },
};

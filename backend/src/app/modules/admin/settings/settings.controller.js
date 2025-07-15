import { SettingsService } from "./settings.service.js";

export const SettingsController = {
  getSettings: async (req, res, next) => {
    try {
      const result = await SettingsService.getSettings(req.prisma, req.user.id);

      return res.status(result.status).json({
        success: result.success,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  },

  updateSettings: async (req, res, next) => {
    try {
      const result = await SettingsService.updateSettings(
        req.prisma,
        req.user.id,
        req.body,
      );

      return res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data || null,
      });
    } catch (error) {
      next(error);
    }
  },
};

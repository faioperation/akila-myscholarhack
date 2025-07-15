import { AdminService } from "./admin.service.js";

export const AdminController = {
  getUserInfo: async (req, res, next) => {
    try {
      const result = await AdminService.getUserInfo(req.prisma, req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  updateUserStatus: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      const result = await AdminService.updateUserStatus(
        req.prisma,
        userId,
        status,
      );

      return res.status(result.status).json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      next(error); // only unexpected errors reach middleware
    }
  },

  // =========================
  // DELETE USER
  // =========================
  activeUser: async (req, res, next) => {
    try {
      const { userId } = req.params;

      const result = await AdminService.activeUser(req.prisma, userId);

      return res.status(result.status).json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      next(error); // only unexpected errors
    }
  },

  hardDeleteUser: async (req, res, next) => {
    try {
      const { userId } = req.params;

      const result = await AdminService.hardDeleteUser(req.prisma, userId);

      return res.status(result.status).json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      next(error); // only real system-level failures
    }
  },

  // =========================
  // CREATE ADMIN
  // =========================
  createAdmin: async (req, res, next) => {
    try {
      const result = await AdminService.createAdmin(req.prisma, req.body);

      return res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data ?? null,
      });
    } catch (error) {
      next(error); // only unexpected errors
    }
  },

  // =========================
  // GET ADMIN LIST
  // =========================
  getAdminList: async (req, res, next) => {
    try {
      const result = await AdminService.getAdminList(req.prisma, req.query);

      return res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      next(error); // only unexpected errors
    }
  },

  // =========================
  // DELETE ADMIN
  // =========================
  deleteAdmin: async (req, res, next) => {
    try {
      const { adminId } = req.params;
      const loggedInAdminId = req.user.id; // from auth token

      const result = await AdminService.deleteAdmin(
        req.prisma,
        adminId,
        loggedInAdminId,
      );

      res.status(result.status).json({
        status: result.status,
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },

  // =========================
  // UPDATE ADMIN
  // =========================
  updateAdmin: async (req, res, next) => {
    try {
      const { adminId } = req.params;
      const loggedInAdminId = req.user.id;

      const result = await AdminService.updateAdmin(
        req.prisma,
        adminId,
        loggedInAdminId,
        req.body,
      );

      return res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data ?? null,
      });
    } catch (error) {
      next(error); // only unexpected system errors
    }
  },

  // =========================
  // GET ALL PLANS (ADMIN)
  // =========================
  getAllPlans: async (req, res, next) => {
    try {
      const plans = await AdminService.getAllPlans(req.prisma);

      res.status(200).json({
        success: true,
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  },

  // =========================
  // TOGGLE PLAN STATUS
  // =========================
  togglePlanStatus: async (req, res, next) => {
    try {
      const { planId } = req.params;

      const result = await AdminService.togglePlanStatus(req.prisma, planId);

      return res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data || null,
      });
    } catch (error) {
      next(error); // only real system errors reach here
    }
  },

  // =========================
  // UPDATE PLAN (EDIT)
  // =========================
  updatePlan: async (req, res, next) => {
    try {
      const { planId } = req.params;

      const result = await AdminService.updatePlan(
        req.prisma,
        planId,
        req.body,
      );

      return res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data || null,
      });
    } catch (error) {
      next(error); // only real system errors
    }
  },

  // =========================
  // DELETE PLAN
  // =========================
  deletePlan: async (req, res, next) => {
    try {
      const { planId } = req.params;

      const result = await AdminService.deletePlan(req.prisma, planId);

      return res.status(result.status).json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      next(error); // only unexpected/system errors
    }
  },

  // =========================
  // CREATE PLAN
  // =========================
  createPlan: async (req, res, next) => {
    try {
      const result = await AdminService.createPlan(req.prisma, req.body);

      return res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data ?? null,
      });
    } catch (error) {
      next(error); // only unexpected/system errors
    }
  },

  // =========================
  // GET ALL OFFERS (ADMIN)
  // =========================
  getAllOffers: async (req, res, next) => {
    try {
      const offers = await AdminService.getAllOffers(req.prisma);

      res.status(200).json({
        success: true,
        data: offers,
      });
    } catch (error) {
      next(error);
    }
  },

  // =========================
  // CREATE OFFER
  // =========================
  createOffer: async (req, res, next) => {
    try {
      const result = await AdminService.createOffer(req.prisma, req.body);

      return res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data ?? null,
      });
    } catch (error) {
      next(error); // only unexpected errors
    }
  },

  // =========================
  // TOGGLE OFFER STATUS
  // =========================
  toggleOfferStatus: async (req, res, next) => {
    try {
      const { offerId } = req.params;

      const result = await AdminService.toggleOfferStatus(req.prisma, offerId);

      res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data ?? null,
      });
    } catch (error) {
      next(error);
    }
  },

  // =========================
  // DELETE OFFER
  // =========================
  deleteOffer: async (req, res, next) => {
    try {
      const { offerId } = req.params;

      const result = await AdminService.deleteOffer(req.prisma, offerId);

      res.status(result.status).json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      next(error); // only REAL unexpected errors go here
    }
  },

  // =========================
  // UPDATE OFFER
  // =========================
  updateOffer: async (req, res, next) => {
    try {
      const { offerId } = req.params;

      const result = await AdminService.updateOffer(
        req.prisma,
        offerId,
        req.body,
      );

      res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      next(error); // only unexpected errors
    }
  },

  // =========================
  // CREATE FAQ
  // =========================
  createFaq: async (req, res, next) => {
    try {
      const result = await AdminService.createFaq(req.prisma, req.body);

      res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      next(error); // unexpected/system errors only
    }
  },

  // =========================
  // UPDATE FAQ
  // =========================
  updateFaq: async (req, res, next) => {
    try {
      const { faqId } = req.params;

      const result = await AdminService.updateFaq(req.prisma, faqId, req.body);

      res.status(result.status).json(result);
    } catch (error) {
      next(error);
    }
  },

  // =========================
  // DELETE FAQ
  // =========================
  deleteFaq: async (req, res, next) => {
    try {
      const { faqId } = req.params;

      const result = await AdminService.deleteFaq(req.prisma, faqId);

      res.status(result.status).json(result);
    } catch (error) {
      next(error);
    }
  },

  // =========================
  // GET ALL FAQ (ADMIN)
  // =========================
  getAllFaqs: async (req, res, next) => {
    try {
      const faqs = await AdminService.getAllFaqs(req.prisma);

      res.status(200).json({
        success: true,
        data: faqs,
      });
    } catch (error) {
      next(error);
    }
  },

  // =========================
  // GET FAQ BY CATEGORY (ADMIN)
  // =========================
  getFaqsByCategory: async (req, res, next) => {
    try {
      const { category } = req.query;

      const result = await AdminService.getFaqsByCategory(req.prisma, category);

      res.status(result.status).json(result);
    } catch (error) {
      next(error);
    }
  },

  // =========================
  // DASHBOARD OVERVIEW
  // =========================
  getDashboardOverview: async (req, res, next) => {
    try {
      const result = await AdminService.getDashboardOverview(req.prisma);
      res.status(result.status).json(result);
    } catch (error) {
      next(error);
    }
  },

  // =========================
  // SALES TRACK (OPTIMIZED)
  // =========================
  getSalesTrack: async (req, res, next) => {
    try {
      const { type = "day" } = req.query;

      const result = await AdminService.getSalesTrack(req.prisma, type);

      res.status(result.status).json(result);
    } catch (error) {
      next(error);
    }
  },

  // =========================
  // GET REVENUE ANALYTICS
  // =========================
  getRevenueAnalytics: async (req, res, next) => {
    try {
      const result = await AdminService.getRevenueAnalytics(req.prisma);
      res.status(result.status).json(result);
    } catch (error) {
      next(error);
    }
  },

  // =========================
  // ANALYTICS OVERVIEW
  // =========================
  getAnalyticsOverview: async (req, res, next) => {
    try {
      const result = await AdminService.getAnalyticsOverview(req.prisma);
      res.status(result.status).json(result);
    } catch (error) {
      next(error);
    }
  },
};

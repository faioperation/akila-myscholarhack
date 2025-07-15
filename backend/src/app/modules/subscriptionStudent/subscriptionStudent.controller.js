// src/app/modules/subscription/subscriptionStudent.controller.js

import { SubscriptionStudentService } from "./subscriptionStudent.service.js";
import DevBuildError from "../../lib/DevBuildError.js";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse.js";
import { AdminService } from "../admin/admin.service.js";



const getMySubscription = async (req, res, next) => {
  try {
    const prisma = req.app.get("prisma");
    const userId = req.user.id;

    console.log(`🔍 Fetching subscriptions for userId: ${userId}`);

    const subscriptions =
      await SubscriptionStudentService.getMySubscription(prisma, userId);

    console.log(`📊 Found ${subscriptions.length} subscriptions for user ${userId}`);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Subscriptions fetched successfully",
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

const getSubscriptionById = async (req, res, next) => {
  try {
    const prisma = req.app.get("prisma");
    const userId = req.user.id;
    const { id } = req.params;

    const subscription = await SubscriptionStudentService.getById(prisma, id, userId);

    if (!subscription) {
      throw new DevBuildError("Subscription not found", StatusCodes.NOT_FOUND);
    }

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Subscription fetched successfully",
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

const getAllPlans = async (req, res, next) => {
  try {
    const plans = await AdminService.getAllPlans(req.prisma);

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
}

const purchaseSubscription = async (req, res, next) => {
  try {
    const prisma = req.app.get("prisma");
    const userId = req.user.id;
    const { planId, durationType } = req.body;

    if (!planId) {
      throw new DevBuildError(
        "planId is required",
        StatusCodes.BAD_REQUEST
      );
    }

    const subscription =
      await SubscriptionStudentService.purchaseSubscription(
        prisma,
        userId,
        planId,
        durationType
      );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Subscription purchase successfully",
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

const toggleSubscriptionStatus = async (req, res, next) => {
  try {
    const prisma = req.app.get("prisma");
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const subscription = await SubscriptionStudentService.toggleStatus(
      prisma,
      id,
      userId,
      status
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: `Subscription set to ${status} successfully`,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

const cancelSubscription = async (req, res, next) => {
  try {
    const prisma = req.app.get("prisma");
    const userId = req.user.id;
    const { id } = req.params;

    const subscription =
      await SubscriptionStudentService.cancelSubscription(prisma, userId, id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Subscription cancelled successfully",
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const SubscriptionStudentController = {
  getMySubscription,
  getSubscriptionById,
  purchaseSubscription,
  toggleSubscriptionStatus,
  cancelSubscription,
  getAllPlans
};

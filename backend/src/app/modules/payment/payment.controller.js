import { paymentService } from "./payment.service.js";
import { createNotificationForAdmins } from "../notification/notification.service.js";
import { StatusCodes } from "http-status-codes";

const handleSamcartWebhook = async (req, res, next) => {
  try {
    const payload = req.body;
    console.log("Processing SamCart Payload:", payload);
    await paymentService.processSamcartEvent(payload);

    // 🔔 Admin Notification Hook (crash-safe)
    try {
      const userEmail = payload?.customer?.email || "Unknown user";
      const fullName = `${payload?.customer?.first_name || ""} ${
        payload?.customer?.last_name || ""
      }`.trim();

      const productName = payload?.product?.name || "Unknown plan";
      const price = payload?.product?.price || "";

      const displayName = fullName || userEmail;

      await createNotificationForAdmins({
        title: "New Plan Purchased",
        message: `${displayName} (${userEmail}) purchased ${productName} for $${price}`,
        type: "PLAN_PURCHASE",
      });
    } catch (notifyError) {
      console.error(
        "⚠️ Failed to send payment notification:",
        notifyError.message,
      );
      // DO NOT throw
    }

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const recentSub = await paymentService.checkRecentSubscription(userId);

    if (!recentSub) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message:
          "No recent successful payment found. Please wait a moment or contact support if the issue persists.",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Payment verified successfully",
      data: recentSub,
    });
  } catch (error) {
    next(error);
  }
};

const initiatePurchase = async (req, res, next) => {
  try {
    const { planKey } = req.params;
    const email = req.body.email;
    const { durationType } = req.body;

    const checkoutUrl = await paymentService.getCheckoutUrl(
      planKey,
      email,
      durationType,
    );

    if (!checkoutUrl) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `Plan not found: ${planKey}`,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Checkout URL generated successfully",
      data: { checkoutUrl },
    });
  } catch (error) {
    next(error);
  }
};

const initiatePurchasefor_get = async (req, res, next) => {
  try {
    const { planKey } = req.params;
    const email = req.user.email;
    const { durationType } = req.query;

    const checkoutUrl = await paymentService.getCheckoutUrl(
      planKey,
      email,
      durationType,
    );

    if (!checkoutUrl) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `Plan not found: ${planKey}`,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Checkout URL generated successfully",
      data: { checkoutUrl },
    });
  } catch (error) {
    next(error);
  }
};
export const paymentController = {
  handleSamcartWebhook,
  verifyPayment,
  initiatePurchase,
  initiatePurchasefor_get,
};

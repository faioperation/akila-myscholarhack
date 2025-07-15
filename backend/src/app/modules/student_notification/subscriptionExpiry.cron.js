import cron from "node-cron";
import prisma from "../../prisma/client.js";
import { createNotificationForStudent } from "./notification.service.js";

const MS_IN_DAY = 24 * 60 * 60 * 1000;

export const startSubscriptionExpiryCron = () => {
  console.log("⏰ Subscription expiry cron started (every 12 hours)");

  cron.schedule("0 */12 * * *", async () => {
    console.log("⏰ Running subscription expiry cron...");

    try {
      const now = new Date();

      const subscriptions = await prisma.subscription.findMany({
        where: {
          status: "active",
          expiresAt: {
            not: null,
          },
        },
        include: {
          user: true,
          plan: true,
        },
      });

      for (const sub of subscriptions) {
        const diffMs = new Date(sub.expiresAt) - now;
        const diffDays = Math.floor(diffMs / MS_IN_DAY);

        console.log("📅 expiresAt:", sub.expiresAt);
        console.log("⏱ Diff days:", diffDays, "for", sub.user.email);

        let type = null;
        let title = null;
        let message = null;

        if (diffDays === 3) {
          type = "SUBSCRIPTION_EXPIRES_3_DAYS";
          title = "Subscription expiring soon";
          message = `Your ${sub.plan.name} plan will expire in 3 days.`;
        } else if (diffDays === 1) {
          type = "SUBSCRIPTION_EXPIRES_1_DAY";
          title = "Subscription expiring tomorrow";
          message = `Your ${sub.plan.name} plan will expire tomorrow.`;
        } else if (diffDays <= 0) {
          type = "SUBSCRIPTION_EXPIRED";
          title = "Subscription expired";
          message = `Your ${sub.plan.name} plan has expired.`;
        }

        if (!type) continue;

        // Prevent duplicates
        const alreadySent = await prisma.notificationRecipient.findFirst({
          where: {
            userId: sub.userId,
            notification: {
              type,
            },
          },
        });

        if (alreadySent) continue;

        await createNotificationForStudent(sub.userId, {
          title,
          message,
          type,
        });

        console.log("🎓 Student notification sent:", {
          email: sub.user.email,
          type,
        });
      }
    } catch (error) {
      console.error("❌ Subscription expiry cron error:", error);
    }
  });
};

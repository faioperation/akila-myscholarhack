import cron from "node-cron";
import prisma from "../../prisma/client.js";
import { createNotificationForStudent } from "./notification.service.js";

const MS_IN_DAY = 24 * 60 * 60 * 1000;

export const startScholarshipDeadlineCron = () => {
  console.log("🎓 Scholarship deadline cron started (every 1 hour)");

  // Every hour
  cron.schedule("0 * * * *", async () => {
    console.log("⏰ Running scholarship deadline cron...");

    try {
      const now = new Date();

      const applications = await prisma.application.findMany({
        where: {
          scholarshipDeadline: {
            not: null,
          },
        },
        include: {
          user: true,
        },
      });

      for (const app of applications) {
        const diffMs = new Date(app.scholarshipDeadline) - now;
        const diffDays = Math.floor(diffMs / MS_IN_DAY);

        let type = null;
        let title = null;
        let message = null;

        if (diffDays === 7) {
          type = "SCHOLARSHIP_DEADLINE_7_DAYS";
          title = "Scholarship deadline approaching";
          message = `Your scholarship deadline is in 7 days.`;
        } else if (diffDays === 3) {
          type = "SCHOLARSHIP_DEADLINE_3_DAYS";
          title = "Scholarship deadline soon";
          message = `Your scholarship deadline is in 3 days.`;
        } else if (diffDays < 0) {
          type = "SCHOLARSHIP_DEADLINE_EXPIRED";
          title = "Scholarship deadline passed";
          message = `Your scholarship deadline has passed.`;
        }

        if (!type) continue;

        // Prevent duplicate notifications
        const alreadySent = await prisma.notificationRecipient.findFirst({
          where: {
            userId: app.userId,
            notification: {
              type,
            },
          },
        });

        if (alreadySent) continue;

        await createNotificationForStudent(app.userId, {
          title,
          message,
          type,
        });

        console.log("🎓 Scholarship notification sent:", {
          email: app.user.email,
          type,
        });
      }
    } catch (error) {
      console.error("❌ Scholarship deadline cron error:", error);
    }
  });
};

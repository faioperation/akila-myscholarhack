import cron from "node-cron";
import prisma from "../../prisma/client.js";
import { RecommendationService } from "./recommendation.service.js";

export const startScholarshipSyncCron = () => {
    console.log("⏰ Scholarship sync cron started (every 12 hours)");

    // Run every 12 hours
    cron.schedule("0 */12 * * *", async () => {
        console.log("⏰ Running scholarship sync cron...");

        try {
            const syncResult = await RecommendationService.triggerScholarshipSync();
            const saveResult = await RecommendationService.saveScholarships(prisma, syncResult);
            console.log(`✅ scholarship sync cron successful: saved ${saveResult.count} scholarships`);
        } catch (error) {
            console.error("❌ Scholarship sync cron error:", error);
        }
    });
};

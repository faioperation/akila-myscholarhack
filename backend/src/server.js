import http from "http";
import app from "./app.js";
import { envVars } from "./app/config/env.js";
import { connectRedis } from "./app/config/redis.config.js";
import { initSocket } from "./app/socket.js";
import { startSubscriptionExpiryCron } from "./app/modules/student_notification/subscriptionExpiry.cron.js";
import { startScholarshipDeadlineCron } from "./app/modules/student_notification/scholarshipDeadline.cron.js";
import { startScholarshipSyncCron } from "./app/modules/recommendation/scholarshipSync.cron.js";

import prisma from "./app/prisma/client.js";
import { seed } from "../prisma/seed.js";

const PORT = envVars.PORT || 5001;
let server;

const startServer = async () => {
  try {
    // 🌱 Run database seed
    await seed();

    await connectRedis();

    server = http.createServer(app);

    // Socket attach
    initSocket(server);

    // 🔔 Start student subscription cron
    startSubscriptionExpiryCron();
    startScholarshipDeadlineCron();
    startScholarshipSyncCron();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔌 Socket.io attached`);
      console.log(`⏰ Subscription expiry cron started`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};

startServer();

/**
 * 🔴 Unhandled Promise Rejection
 */
process.on("unhandledRejection", async (err) => {
  console.error(
    "Unhandled Rejection Detected... server shutting down...",
    err
  );

  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(1);
    });
  } else {
    await prisma.$disconnect();
    process.exit(1);
  }
});

/**
 * 🔴 Uncaught Exception
 */
process.on("uncaughtException", async (err) => {
  console.error(
    "Uncaught Exception Detected... server shutting down...",
    err
  );

  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(1);
    });
  } else {
    await prisma.$disconnect();
    process.exit(1);
  }
});

/**
 * 🟡 SIGTERM (Docker / Kubernetes)
 */
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received... shutting down gracefully");

  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  }
});

/**
 * 🟡 SIGINT (Ctrl + C)
 */
process.on("SIGINT", async () => {
  console.log("SIGINT signal received... shutting down gracefully");

  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  }
});


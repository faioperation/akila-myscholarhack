import prisma from "../../prisma/client.js";
import { getIO } from "../../socket.js";

// STUDENT NOTIFICATIONS

export const createNotificationForStudent = async (
  userId,
  { title, message, type },
) => {
  try {
    // 1️⃣ Create master notification
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
      },
    });

    // 2️⃣ Create recipient
    const recipient = await prisma.notificationRecipient.create({
      data: {
        userId,
        notificationId: notification.id,
      },
    });

    // 3️⃣ Emit real-time socket event to this student only
    try {
      const io = getIO();
      const room = `student:${userId}`;

      io.to(room).emit("student-notification", {
        recipientId: recipient.id,
        notificationId: notification.id,
        title,
        message,
        type,
        createdAt: notification.createdAt,
      });
    } catch (socketError) {
      console.error("⚠️ Student socket emit failed:", socketError.message);
    }

    return recipient;
  } catch (error) {
    console.error("❌ createNotificationForStudent error:", error);
    throw error;
  }
};

import prisma from "../../prisma/client.js";
import { getIO } from "../../socket.js";

// Create ONE master notification + recipients for all admins
export const createNotificationForAdmins = async ({ title, message, type }) => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "OWNER"] },
      },
      select: { id: true },
    });

    if (!admins.length) return null;

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
      },
    });

    const recipientsData = admins.map((admin) => ({
      userId: admin.id,
      notificationId: notification.id,
    }));

    await prisma.notificationRecipient.createMany({
      data: recipientsData,
    });

    // Emit socket event
    try {
      const io = getIO();
      io.to("admin-room").emit("new-notification", {
        id: notification.id,
        title,
        message,
        type,
        createdAt: notification.createdAt,
      });
    } catch (socketError) {
      console.error("⚠️ Socket emit failed:", socketError.message);
    }

    return notification;
  } catch (error) {
    console.error("❌ createNotificationForAdmins error:", error);
    throw error;
  }
};

// Get notifications for a specific user
export const getUserNotifications = async (userId) => {
  try {
    return await prisma.notificationRecipient.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      include: {
        notification: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("❌ getUserNotifications error:", error);
    throw error;
  }
};

// Mark as read (ownership enforced)
export const markNotificationAsRead = async (recipientId, userId) => {
  try {
    const recipient = await prisma.notificationRecipient.findFirst({
      where: {
        id: recipientId,
        userId,
        isDeleted: false,
      },
    });

    if (!recipient) {
      throw new Error("Notification not found or access denied");
    }

    return await prisma.notificationRecipient.update({
      where: { id: recipientId },
      data: { isRead: true },
    });
  } catch (error) {
    console.error("❌ markNotificationAsRead error:", error);
    throw error;
  }
};

// Soft delete (ownership enforced)
export const deleteNotification = async (recipientId, userId) => {
  try {
    const recipient = await prisma.notificationRecipient.findFirst({
      where: {
        id: recipientId,
        userId,
        isDeleted: false,
      },
    });

    if (!recipient) {
      throw new Error("Notification not found or access denied");
    }

    return await prisma.notificationRecipient.update({
      where: { id: recipientId },
      data: { isDeleted: true },
    });
  } catch (error) {
    console.error("❌ deleteNotification error:", error);
    throw error;
  }
};

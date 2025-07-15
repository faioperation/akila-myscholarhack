import {
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "./notification.service.js";

// Get all notifications for logged-in user
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await getUserNotifications(userId);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("❌ getMyNotifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// Mark a notification as read (per user)
export const markAsRead = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const userId = req.user.id;

    const updated = await markNotificationAsRead(recipientId, userId);

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("❌ markAsRead error:", error);

    return res.status(403).json({
      success: false,
      message: error.message || "Failed to mark notification as read",
    });
  }
};

// Delete a notification (soft delete, per user)
export const removeNotification = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const userId = req.user.id;

    await deleteNotification(recipientId, userId);

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("❌ removeNotification error:", error);

    return res.status(403).json({
      success: false,
      message: error.message || "Failed to delete notification",
    });
  }
};

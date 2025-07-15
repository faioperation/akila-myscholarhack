export const SettingsService = {
  getSettings: async (prisma, userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        settings: {
          select: {
            emailNotifications: true,
            userActivityAlerts: true,
            systemMaintenanceAlerts: true,
          },
        },
      },
    });

    return {
      success: true,
      status: 200,
      data: {
        name: user.name,
        email: user.email,
        emailNotifications: user.settings?.emailNotifications ?? true,
        userActivityAlerts: user.settings?.userActivityAlerts ?? true,
        systemMaintenanceAlerts: user.settings?.systemMaintenanceAlerts ?? true,
      },
    };
  },

  updateSettings: async (prisma, userId, data) => {
    try {
      const {
        name,
        email,
        emailNotifications,
        userActivityAlerts,
        systemMaintenanceAlerts,
      } = data;

      // 1️⃣ Update profile info
      if (name || email) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            ...(name !== undefined && { name }),
            ...(email !== undefined && { email }),
          },
        });
      }

      const existingSettings = await prisma.userSettings.findUnique({
        where: { userId },
      });

      await prisma.userSettings.upsert({
        where: { userId },
        update: {
          emailNotifications:
            emailNotifications ?? existingSettings?.emailNotifications ?? true,
          userActivityAlerts:
            userActivityAlerts ?? existingSettings?.userActivityAlerts ?? true,
          systemMaintenanceAlerts:
            systemMaintenanceAlerts ??
            existingSettings?.systemMaintenanceAlerts ??
            true,
        },
        create: {
          userId,
          emailNotifications: emailNotifications ?? true,
          userActivityAlerts: userActivityAlerts ?? true,
          systemMaintenanceAlerts: systemMaintenanceAlerts ?? true,
        },
      });

      return {
        success: true,
        status: 200,
        message: "Settings updated successfully",
      };
    } catch (error) {
      console.error("Update settings error:", error);

      return {
        success: false,
        status: 400,
        message: "Unable to update settings. Please try again.",
      };
    }
  },
};

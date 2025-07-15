
export const StudentSettingsService = {
    upsertStudentSettings: async (prisma, userId, data) => {
        return prisma.studentSettings.upsert({
            where: { userId },
            update: data,
            create: {
                userId,
                ...data,
            },
        });
    },

    getStudentSettingsByUserId: async (prisma, userId) => {
        return prisma.studentSettings.findUnique({
            where: { userId },
        });
    },
};

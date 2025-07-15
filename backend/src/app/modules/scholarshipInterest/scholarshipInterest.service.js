export const ScholarshipInterestService = {
    upsert: async (prisma, userProfileId, data) => {
        return await prisma.studentScholarshipInterest.upsert({
            where: { userProfileId },
            update: data,
            create: {
                userProfileId,
                ...data,
            },
        });
    },

    findByProfileId: async (prisma, userProfileId) => {
        return await prisma.studentScholarshipInterest.findUnique({
            where: { userProfileId },
        });
    },
};

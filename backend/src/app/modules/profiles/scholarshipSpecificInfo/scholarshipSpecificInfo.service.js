export const ScholarshipSpecificInfoService = {
  getByProfileId: async (prisma, userProfileId) => {
    return prisma.scholarshipSpecificInfo.findUnique({
      where: { userProfileId },
    });
  },

  upsert: async (prisma, userProfileId, data) => {
    return prisma.scholarshipSpecificInfo.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    });
  },
};

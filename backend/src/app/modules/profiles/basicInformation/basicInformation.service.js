export const BasicInformationService = {
  // GET
  getByProfileId: async (prisma, userProfileId) => {
    return prisma.basicInformation.findUnique({
      where: { userProfileId },
    });
  },

  // CREATE or UPDATE
  upsert: async (prisma, userProfileId, data) => {
    return prisma.basicInformation.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    });
  },
};

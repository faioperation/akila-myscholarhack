export const ExtracurricularActivityService = {
  // GET
  getByProfileId: async (prisma, userProfileId) => {
    return prisma.extracurricularActivity.findUnique({
      where: { userProfileId },
    });
  },

  // CREATE or UPDATE
  upsert: async (prisma, userProfileId, data) => {
    return prisma.extracurricularActivity.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    });
  },
};

export const AnythingElseService = {
  // GET
  getByProfileId: async (prisma, userProfileId) => {
    return prisma.anythingElse.findUnique({
      where: { userProfileId },
    });
  },

  // CREATE or UPDATE
  upsert: async (prisma, userProfileId, data) => {
    return prisma.anythingElse.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    });
  },
};

export const DiversityIdentityService = {
  // GET
  getByProfileId: async (prisma, userProfileId) => {
    return prisma.diversityIdentity.findUnique({
      where: { userProfileId },
    });
  },

  // CREATE or UPDATE
  upsert: async (prisma, userProfileId, data) => {
    return prisma.diversityIdentity.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    });
  },
};

export const FamilyBackgroundService = {
  // GET
  getByProfileId: async (prisma, userProfileId) => {
    return prisma.familyBackground.findUnique({
      where: { userProfileId },
    });
  },

  // CREATE OR UPDATE (UPSERT)
  upsert: async (prisma, userProfileId, data) => {
    return prisma.familyBackground.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    });
  },
};

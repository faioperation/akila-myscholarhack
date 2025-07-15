export const UniqueExperienceService = {
  // GET
  getByProfileId: async (prisma, userProfileId) => {
    return prisma.uniqueExperience.findUnique({
      where: { userProfileId },
    });
  },

  // CREATE or UPDATE
  upsert: async (prisma, userProfileId, data) => {
    return prisma.uniqueExperience.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    });
  },
};

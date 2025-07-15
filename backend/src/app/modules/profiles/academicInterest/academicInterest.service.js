export const AcademicInterestService = {
  // GET
  getByProfileId: async (prisma, userProfileId) => {
    return prisma.academicInterest.findUnique({
      where: { userProfileId },
    });
  },

  // UPSERT
  upsert: async (prisma, userProfileId, data) => {
    return prisma.academicInterest.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    });
  },

  // CREATE (POST)
  create: async (prisma, userProfileId, data) => {
    return prisma.academicInterest.create({
      data: {
        userProfileId,
        ...data,
      },
    });
  },

  // UPDATE (PUT/PATCH)
  update: async (prisma, userProfileId, data) => {
    return prisma.academicInterest.update({
      where: { userProfileId },
      data,
    });
  },
};

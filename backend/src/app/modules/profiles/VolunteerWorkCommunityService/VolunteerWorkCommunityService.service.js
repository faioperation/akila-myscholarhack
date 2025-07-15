export const VolunteerService = {
  // GET
  getByProfileId: async (prisma, userProfileId) => {
    return prisma.volunteerWork.findUnique({
      where: { userProfileId },
    });
  },

  // CREATE or UPDATE (UPSERT)
  upsert: async (prisma, userProfileId, data) => {
    return prisma.volunteerWork.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    });
  },
};

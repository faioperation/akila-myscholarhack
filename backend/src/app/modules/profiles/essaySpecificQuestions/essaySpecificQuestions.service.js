export const EssaySpecificQuestionsService = {
  // GET
  getByProfileId: async (prisma, userProfileId) => {
    return prisma.essaySpecificQuestions.findUnique({
      where: { userProfileId },
    });
  },

  // CREATE or UPDATE
  upsert: async (prisma, userProfileId, data) => {
    return prisma.essaySpecificQuestions.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    });
  },
};

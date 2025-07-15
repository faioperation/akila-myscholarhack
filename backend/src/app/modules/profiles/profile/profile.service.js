export const ProfileService = {
  // ✅ Create profile
  create: async (prisma, data) =>
    prisma.userProfile.create({
      data,
    }),

  // ✅ Find profile by profile ID
  findById: async (prisma, id) =>
    prisma.userProfile.findUnique({
      where: { id },
    }),

  // ✅ Find profile by userId (MOST IMPORTANT)
  findByUserId: async (prisma, userId) =>
    prisma.userProfile.findUnique({
      where: { userId },
      include: {
        education: true,
        essays: true,
        academicInterest: true,
        familyBackground: true,
        uniqueExperience: true,
        basicInformation: true,
        extraCurricularsActivity: true,
        volunteerWork: true,
        diversityIdentity: true,
        scholarshipSpecificInfo: true,
        anythingElse: true,
        essaySpecificQuestions: true,
      },
    }),

  // ✅ Get all profiles (admin use-case)
  findAll: async (prisma) =>
    prisma.userProfile.findMany({
      include: {
        user: true,
      },
    }),

  // ✅ Update profile by ID
  updateById: async (prisma, id, data) =>
    prisma.userProfile.update({
      where: { id },
      data,
    }),

  // ✅ UPSERT profile by userId (MOST IMPORTANT)
  upsertByUserId: async (prisma, userId, data) =>
    prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    }),

  // ✅ Update profile by userId (more practical)
  updateByUserId: async (prisma, userId, data) =>
    prisma.userProfile.update({
      where: { userId },
      data,
    }),

  // ✅ Delete profile by ID
  deleteById: async (prisma, id) =>
    prisma.userProfile.delete({
      where: { id },
    }),

  // ✅ Delete profile by userId
  deleteByUserId: async (prisma, userId) =>
    prisma.userProfile.delete({
      where: { userId },
    }),
};
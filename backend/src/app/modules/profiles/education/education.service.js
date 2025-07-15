import prisma from "../../../prisma/client.js";


export const createEducation = async (userProfileId, data) => {
  const educationData = {
    institutionName: data.institutionName,
    level: data.level,
    startYear: data.startYear ? parseInt(data.startYear) : undefined,
    endYear: data.endYear ? parseInt(data.endYear) : undefined,
    major: data.major,
    achievements: data.achievements,
  };

  return prisma.education.upsert({
    where: { userProfileId },
    update: educationData,
    create: {
      userProfileId,
      ...educationData,
    },
  });
};

export const getEducationsByProfile = async (userProfileId) => {
  return prisma.education.findMany({
    where: { userProfileId },
    orderBy: { startYear: "desc" },
  });
};

export const deleteEducation = async (id, userProfileId) => {
  return prisma.education.deleteMany({
    where: { id, userProfileId },
  });
};

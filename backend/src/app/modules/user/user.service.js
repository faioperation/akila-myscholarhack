import { envVars } from "../../config/env.js";
import DevBuildError from "../../lib/DevBuildError.js";
import bcrypt from "bcrypt";

export const UserService = {

  // BASIC FIND METHODS

  findByEmail: async (prisma, email) =>
    prisma.user.findUnique({ where: { email } }),

  findByUsername: async (prisma, username) =>
    prisma.user.findUnique({ where: { username } }),

  findById: async (prisma, id) =>
    prisma.user.findUnique({ where: { id } }),


  // ✅ ONLY USER INFO (NO PROFILE)

  findUserInfoById: async (prisma, id) =>
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        phoneNumber: true,
        role: true,
        isVerified: true,
        status: true,
        isPlan: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            fullName: true,
            profilePicture: true,
            filePath: true,
            profileUrl: true,
          }
        },
        studentSettings: {
          select: {
            fullName: true,
          }
        }
      },
    }),


  // UPDATE / DELETE

  update: async (prisma, id, data) => {
    // Synchronization logic for name/fullName and picture/profilePicture
    const name = data.name || data.fullName;
    const picture = data.picture || data.profilePicture || data.userPicture;
    const filePath = data.filePath;
    const profileUrl = data.profileUrl;

    // 🛡️ Construct clean updateData for User model
    const userFields = [
      "email", "name", "passwordHash", "phoneNumber", "picture",
      "role", "status", "isVerified", "isDeleted", "isPlan", "forgotPasswordStatus"
    ];

    const updateData = {};
    userFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    if (name) {
      updateData.name = name;
    }
    if (picture) {
      updateData.picture = picture;
    }

    // Perform the update on User
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Sync to UserProfile
    if (name || picture || filePath || profileUrl) {
      const profileData = {};
      if (name) profileData.fullName = name;
      if (picture) profileData.profilePicture = picture;
      if (filePath) profileData.filePath = filePath;
      if (profileUrl) profileData.profileUrl = profileUrl;

      await prisma.userProfile.upsert({
        where: { userId: id },
        update: profileData,
        create: {
          userId: id,
          ...profileData,
        },
      });
    }

    // Sync to StudentSettings
    if (name) {
      await prisma.studentSettings.upsert({
        where: { userId: id },
        update: { fullName: name },
        create: {
          userId: id,
          fullName: name,
        },
      });
    }

    return updatedUser;
  },

  delete: async (prisma, id) =>
    prisma.user.delete({
      where: { id },
    }),


  // USER + FULL PROFILE

  findByIdWithProfile: async (prisma, id) =>
    prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            education: true,
            essays: true,
            academicInterest: true,
            familyBackground: true,
            essaySpecificQuestions: true,
            uniqueExperience: true,
            basicInformation: true,
            extraCurricularsActivity: true,
            volunteerWork: true,
            diversityIdentity: true,
            scholarshipSpecificInfo: true,
            anythingElse: true,
            essayComparisons: true,
          },
        },
      },
    }),

  findAllWithProfile: async (prisma) =>
    prisma.user.findMany({
      include: {
        profile: {
          include: {
            education: true,
            essays: true,
            academicInterest: true,
            familyBackground: true,
            essaySpecificQuestions: true,
            uniqueExperience: true,
            basicInformation: true,
            extraCurricularsActivity: true,
            volunteerWork: true,
            diversityIdentity: true,
            scholarshipSpecificInfo: true,
            anythingElse: true,
            essayComparisons: true,
          },
        },
      },
    }),
};


export const createUserService = async (payload) => {
  const { prisma, email, password, picture, ...rest } = payload;

  if (!email || !password) {
    throw new DevBuildError("Email and password are required", 400);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new DevBuildError("User already exists", 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(envVars.BCRYPT_SALT_ROUND || 10)
  );

  // Create user + auth provider in one transaction
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      picture,
      isVerified: false,
      role: "STUDENT",
      ...rest,

      auths: {
        create: {
          provider: "EMAIL",
          providerId: email,
        },
      },
      profile: {
        create: {
          fullName: rest.name,
        },
      },
    },
    include: {
      auths: true,
    },
  });

  return user;
};




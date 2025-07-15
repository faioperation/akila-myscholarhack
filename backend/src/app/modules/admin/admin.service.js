import bcrypt from "bcrypt";
import { success } from "zod";

export const AdminService = {
  getUserInfo: async (prisma, query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: "STUDENT", // ✅ FIXED (enum)
          isDeleted: false, // ✅ IMPORTANT
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          profile: {
            select: {
              fullName: true, // ✅ FIXED (schema field)
            },
          },
          essays: {
            where: {
              isDeleted: false,
              status: { in: ["SAVED", "EDITED"] },
            },
            select: { id: true },
          },
          subscriptions: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              plan: {
                select: {
                  name: true, // ✅ FIXED (schema field)
                },
              },
            },
          },
        },
      }),

      prisma.user.count({
        where: {
          role: "STUDENT", // ✅ FIXED
          isDeleted: false,
        },
      }),
    ]);

    const formattedUsers = users.map((user, index) => {
      const latestSubscription = user.subscriptions[0];

      return {
        no: skip + index + 1,
        id: user.id,
        name: user.profile?.fullName || user.name,
        email: user.email,
        totalEssays: user.essays.length,
        subscriptionPlan: latestSubscription?.plan?.name || "Free",
        status: latestSubscription ? "ACTIVE" : "INACTIVE",
      };
    });

    return {
      meta: {
        total,
        page,
        limit,
      },
      users: formattedUsers,
    };
  },

  // =========================
  // UPDATE USER STATUS (SAFE)
  // =========================
  updateUserStatus: async (prisma, userId, status) => {
    const allowedStatus = ["ACTIVE", "INACTIVE"];

    // 1️⃣ Validate status
    if (!allowedStatus.includes(status)) {
      return {
        success: false,
        status: 400,
        message: "Invalid status. Allowed: ACTIVE, INACTIVE",
      };
    }

    // 2️⃣ Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.isDeleted) {
      return {
        success: false,
        status: 404,
        message: "User not found",
      };
    }

    // 3️⃣ Get latest subscription
    const latestSubscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // =========================
    // SET INACTIVE
    // =========================
    if (status === "INACTIVE") {
      if (!latestSubscription) {
        return {
          success: true,
          status: 200,
          message: "User is already inactive",
        };
      }

      await prisma.subscription.delete({
        where: { id: latestSubscription.id },
      });

      return {
        success: true,
        status: 200,
        message: "User deactivated successfully",
      };
    }

    // =========================
    // SET ACTIVE
    // =========================
    if (latestSubscription) {
      return {
        success: true,
        status: 200,
        message: "User is already active",
      };
    }

    // 4️⃣ Find cheapest active plan
    const plan = await prisma.plan.findFirst({
      where: { isActive: true },
      orderBy: { monthlyPrice: "asc" },
    });

    if (!plan) {
      return {
        success: false,
        status: 409,
        message: "No active plan exists. Please create a plan first.",
      };
    }

    await prisma.subscription.create({
      data: {
        status: "active", // enum value
        user: { connect: { id: userId } },
        plan: { connect: { id: plan.id } },
      },
    });

    return {
      success: true,
      status: 200,
      message: "User activated successfully",
    };
  },

  // =========================
  // DELETE USER (SOFT DELETE - SAFE)
  // =========================
  activeUser: async (prisma, userId) => {
    // 1️⃣ Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.isDeleted) {
      return {
        success: false,
        status: 404,
        message: "User not found",
      };
    }

    // 2️⃣ Soft delete user
    await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        status: "INACTIVE",
      },
    });

    await prisma.subscription.deleteMany({
      where: { userId },
    });

    return {
      success: true,
      status: 200,
      message: "User Status Changed successfully",
    };
  },

  hardDeleteUser: async (prisma, userId) => {
    try {
      // 1️⃣ Check user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          status: 404,
          message: "User not found",
        };
      }

      // 2️⃣ Transaction: delete everything safely
      await prisma.$transaction(async (tx) => {
        // ---- Auth & settings
        await tx.authProvider.deleteMany({ where: { userId } });
        await tx.userSettings.deleteMany({ where: { userId } });
        await tx.notificationRecipient.deleteMany({ where: { userId } });

        // ---- Subscriptions
        await tx.subscriptionStudent.deleteMany({ where: { userId } });
        await tx.subscription.deleteMany({ where: { userId } });

        // ---- Applications & recommendations
        await tx.application.deleteMany({ where: { userId } });
        await tx.recommendation.deleteMany({ where: { userId } });

        // ---- Essays & comparisons
        await tx.essayComparison.deleteMany({ where: { userId } });
        await tx.essay.deleteMany({ where: { userId } });

        // ---- Profile-related (via UserProfile)
        const profile = await tx.userProfile.findUnique({
          where: { userId },
          select: { id: true },
        });

        if (profile) {
          const profileId = profile.id;

          await tx.basicInformation.deleteMany({
            where: { userProfileId: profileId },
          });
          await tx.academicInterest.deleteMany({
            where: { userProfileId: profileId },
          });
          await tx.education.deleteMany({
            where: { userProfileId: profileId },
          });
          await tx.volunteerWork.deleteMany({
            where: { userProfileId: profileId },
          });
          await tx.familyBackground.deleteMany({
            where: { userProfileId: profileId },
          });
          await tx.uniqueExperience.deleteMany({
            where: { userProfileId: profileId },
          });
          await tx.diversityIdentity.deleteMany({
            where: { userProfileId: profileId },
          });
          await tx.scholarshipSpecificInfo.deleteMany({
            where: { userProfileId: profileId },
          });
          await tx.anythingElse.deleteMany({
            where: { userProfileId: profileId },
          });
          await tx.essaySpecificQuestions.deleteMany({
            where: { userProfileId: profileId },
          });
          await tx.extracurricularActivity.deleteMany({
            where: { userProfileId: profileId },
          });

          await tx.userProfile.delete({ where: { id: profileId } });
        }

        // ---- Finally delete user
        await tx.user.delete({ where: { id: userId } });
      });

      return {
        success: true,
        status: 200,
        message: "User and all related data permanently deleted",
      };
    } catch (error) {
      console.error("Hard delete user error:", error);

      return {
        success: false,
        status: 400,
        message: "Failed to permanently delete user",
      };
    }
  },

  // =========================
  // CREATE ADMIN (SAFE VERSION)
  // =========================
  createAdmin: async (prisma, data) => {
    const { name, email, number } = data;

    // 1️⃣ Required validation
    if (!email) {
      return {
        success: false,
        status: 400,
        message: "Email is required",
      };
    }

    // 2️⃣ Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        status: 409,
        message: "User with this email already exists",
      };
    }

    // 3️⃣ Fixed default password
    const defaultPassword = "admin@123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 4️⃣ Create admin
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: "ADMIN", // enum-safe
        profile: {
          create: {
            fullName: name || "Admin",
            bio: number ? `Phone: ${number}` : null,
          },
        },
      },
    });

    return {
      success: true,
      status: 201,
      message: "Admin created successfully",
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        defaultPassword, // show once
      },
    };
  },

  // =========================
  // GET ADMIN LIST (SAFE)
  // =========================
  getAdminList: async (prisma, query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [admins, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: "ADMIN",
          isDeleted: false,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          profile: {
            select: {
              bio: true,
            },
          },
        },
      }),

      prisma.user.count({
        where: {
          role: "ADMIN",
          isDeleted: false,
        },
      }),
    ]);

    const formattedAdmins = admins.map((admin, index) => ({
      no: skip + index + 1,
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.profile?.bio
        ? admin.profile.bio.replace("Phone: ", "")
        : "N/A",
    }));

    return {
      success: true,
      status: 200,
      message: "Admin list fetched successfully",
      data: {
        meta: {
          total,
          page,
          limit,
        },
        admins: formattedAdmins,
      },
    };
  },

  // =========================
  // DELETE ADMIN (SAFE)
  // =========================
  deleteAdmin: async (prisma, adminId, loggedInAdminId) => {
    // 1️⃣ Prevent self-delete
    if (adminId === loggedInAdminId) {
      return {
        success: false,
        status: 400,
        message: "You cannot delete your own admin account",
      };
    }

    // 2️⃣ Check target user exists and is admin
    const targetAdmin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!targetAdmin || targetAdmin.role !== "ADMIN") {
      return {
        success: false,
        status: 404,
        message: "Admin not found",
      };
    }

    // 3️⃣ Count total admins
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    // 4️⃣ Prevent deleting last admin
    if (adminCount <= 1) {
      return {
        success: false,
        status: 400,
        message: "Cannot delete the last remaining admin",
      };
    }

    // 5️⃣ Delete admin safely
    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { userId: adminId } }),
      prisma.subscription.deleteMany({ where: { userId: adminId } }),
      prisma.application.deleteMany({ where: { userId: adminId } }),
      prisma.essay.deleteMany({ where: { userId: adminId } }),
      prisma.userProfile.deleteMany({ where: { userId: adminId } }),
      prisma.user.delete({ where: { id: adminId } }),
    ]);

    return {
      success: true,
      status: 200,
      message: "Admin deleted successfully",
    };
  },

  // =========================
  // UPDATE ADMIN (SAFE)
  // =========================
  updateAdmin: async (prisma, adminId, loggedInAdminId, data) => {
    const { name, email, number } = data;

    // 1️⃣ Prevent self edit
    if (adminId === loggedInAdminId) {
      return {
        success: false,
        status: 400,
        message: "You cannot edit your own admin account",
      };
    }

    // 2️⃣ Check admin exists
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      include: { profile: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return {
        success: false,
        status: 404,
        message: "Admin not found",
      };
    }

    // 3️⃣ Email uniqueness check
    if (email && email !== admin.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return {
          success: false,
          status: 409,
          message: "Email already in use",
        };
      }
    }

    // 4️⃣ Update admin + profile (schema-safe)
    const updatedAdmin = await prisma.user.update({
      where: { id: adminId },
      data: {
        name: name ?? admin.name,
        email: email ?? admin.email,
        profile: {
          upsert: {
            create: {
              fullName: name ?? admin.name,
              bio: number ? `Phone: ${number}` : null,
            },
            update: {
              fullName: name ?? admin.profile?.fullName ?? admin.name,
              bio: number ? `Phone: ${number}` : admin.profile?.bio,
            },
          },
        },
      },
    });

    return {
      success: true,
      status: 200,
      message: "Admin updated successfully",
      data: {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
      },
    };
  },

  // =========================
  // GET ALL PLANS (ADMIN)
  // =========================
  getAllPlans: async (prisma) => {
    return prisma.plan.findMany({
      orderBy: {
        sortOrder: "asc",
      },
    });
  },

  togglePlanStatus: async (prisma, planId) => {
    if (!planId) {
      return {
        success: false,
        status: 400,
        message: "Plan ID is required",
      };
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      select: {
        id: true,
        name: true,
        isActive: true,
        isFeatured: true,
      },
    });

    if (!plan) {
      return {
        success: false,
        status: 404,
        message: "Plan not found",
      };
    }

    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: {
        isActive: !plan.isActive,
      },
    });

    return {
      success: true,
      status: 200,
      message: `Plan "${updatedPlan.name}" ${updatedPlan.isActive ? "activated" : "deactivated"
        } successfully`,
      data: updatedPlan,
    };
  },

  // =========================
  // UPDATE PLAN (EDIT PLAN) — SAFE
  // =========================
  updatePlan: async (prisma, planId, data) => {
    const {
      name,
      description,
      monthlyPrice,
      yearlyPrice,
      features,
      planType,
      durationType,
      sortOrder,
    } = data;

    // 1️⃣ Check plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return {
        success: false,
        status: 404,
        message: "Plan not found",
      };
    }

    // 2️⃣ If name is changing, ensure uniqueness
    if (name && name !== plan.name) {
      const nameExists = await prisma.plan.findUnique({
        where: { name },
      });

      if (nameExists) {
        return {
          success: false,
          status: 400,
          message: "Plan name already exists",
        };
      }
    }

    // 3️⃣ Update plan
    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: {
        name: name ?? plan.name,
        description: description ?? plan.description,
        monthlyPrice: monthlyPrice ?? plan.monthlyPrice,
        yearlyPrice: yearlyPrice ?? plan.yearlyPrice,
        planType: planType ?? plan.planType,
        durationType: durationType ?? plan.durationType,
        features: Array.isArray(features) ? features : plan.features,
        sortOrder: sortOrder ?? plan.sortOrder,
      },
    });

    return {
      success: true,
      status: 200,
      message: "Plan updated successfully",
      data: updatedPlan,
    };
  },

  // =========================
  // DELETE PLAN (SAFE)
  // =========================
  deletePlan: async (prisma, planId) => {
    // 1️⃣ Check plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        subscriptions: true,
      },
    });

    if (!plan) {
      return {
        success: false,
        status: 404,
        message: "Plan not found",
      };
    }

    // 2️⃣ Prevent delete if plan is in use
    if (plan.subscriptions.length > 0) {
      return {
        success: false,
        status: 400,
        message:
          "Cannot delete plan. There are active subscriptions using this plan.",
      };
    }

    // 3️⃣ Delete plan
    await prisma.plan.delete({
      where: { id: planId },
    });

    return {
      success: true,
      status: 200,
      message: "Plan deleted successfully",
    };
  },

  // =========================
  // CREATE PLAN (SAFE)
  // =========================
  createPlan: async (prisma, data) => {
    const {
      name,
      description,
      features,
      planType,
      durationType,
      monthlyPrice,
      yearlyPrice,
      isActive = true,
      sortOrder = 0,
    } = data;

    // 1️⃣ Validate required fields
    if (!name || monthlyPrice == null || yearlyPrice == null) {
      return {
        success: false,
        status: 400,
        message: "Name, monthlyPrice and yearlyPrice are required",
      };
    }

    // 2️⃣ Check unique plan name
    const existingPlan = await prisma.plan.findUnique({
      where: { name },
    });

    if (existingPlan) {
      return {
        success: false,
        status: 409,
        message: "Plan with this name already exists",
      };
    }

    // 3️⃣ Create plan
    const plan = await prisma.plan.create({
      data: {
        name,
        description,
        features: Array.isArray(features) ? features : [],
        planType,
        durationType,
        monthlyPrice,
        yearlyPrice,
        isActive,
        sortOrder,
      },
    });

    return {
      success: true,
      status: 201,
      message: "Plan created successfully",
      data: plan,
    };
  },

  // =========================
  // GET ALL OFFERS (ADMIN)
  // =========================
  getAllOffers: async (prisma) => {
    // 🔥 auto-expire first
    const now = new Date();

    await prisma.offer.updateMany({
      where: {
        isActive: true,
        endDate: {
          lt: now,
        },
      },
      data: {
        isActive: false,
      },
    });

    // then fetch offers
    return prisma.offer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  // =========================
  // Create OFFERS (ADMIN)
  // =========================
  createOffer: async (prisma, data) => {
    const { title, description, ctaText, discountValue, startDate, endDate } =
      data;

    // 1️⃣ Required fields
    if (!title || discountValue == null || !startDate || !endDate) {
      return {
        success: false,
        status: 400,
        message: "title, discountValue, startDate, and endDate are required",
      };
    }

    // 2️⃣ Discount validation
    if (discountValue <= 0 || discountValue > 100) {
      return {
        success: false,
        status: 400,
        message: "discountValue must be between 1 and 100",
      };
    }

    // 3️⃣ Date validation
    if (new Date(startDate) >= new Date(endDate)) {
      return {
        success: false,
        status: 400,
        message: "Start date must be before end date",
      };
    }

    // 🔐 NO DUPLICATE TITLES (active or inactive)
    const existingOffer = await prisma.offer.findFirst({
      where: { title },
    });

    if (existingOffer) {
      return {
        success: false,
        status: 409,
        message: "Offer with this title already exists",
      };
    }

    // 🔥 ONLY ONE ACTIVE OFFER AT A TIME
    await prisma.offer.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // 4️⃣ Create new ACTIVE offer
    const offer = await prisma.offer.create({
      data: {
        title,
        description,
        ctaText,
        discountType: "PERCENT",
        discountValue,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
      },
    });

    return {
      success: true,
      status: 201,
      message: "Offer created and activated successfully",
      data: offer,
    };
  },

  // =========================
  // TOGGLE OFFER STATUS
  // =========================
  toggleOfferStatus: async (prisma, offerId) => {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      return {
        success: false,
        status: 404,
        message: "Offer not found",
      };
    }

    // 🔥 If activating → deactivate all others
    if (!offer.isActive) {
      await prisma.offer.updateMany({
        where: {
          isActive: true,
          NOT: { id: offer.id },
        },
        data: { isActive: false },
      });
    }

    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: {
        isActive: !offer.isActive,
      },
    });

    return {
      success: true,
      status: 200,
      message: "Offer status updated",
      data: updatedOffer,
    };
  },

  // =========================
  // DELETE OFFER
  // =========================
  deleteOffer: async (prisma, offerId) => {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      return {
        success: false,
        status: 404,
        message: "Offer not found",
      };
    }

    await prisma.offer.delete({
      where: { id: offerId },
    });

    return {
      success: true,
      status: 200,
      message: "Offer deleted successfully",
    };
  },

  // =========================
  // UPDATE OFFER (EDIT)
  // =========================
  updateOffer: async (prisma, offerId, data) => {
    const {
      title,
      description,
      ctaText,
      discountValue,
      startDate,
      endDate,
      isActive,
    } = data;

    // 1️⃣ Check offer exists
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      return {
        success: false,
        status: 404,
        message: "Offer not found",
      };
    }

    // 2️⃣ Title uniqueness (GLOBAL – no duplicates)
    if (title && title !== offer.title) {
      const existingTitle = await prisma.offer.findFirst({
        where: {
          title,
          NOT: { id: offerId },
        },
      });

      if (existingTitle) {
        return {
          success: false,
          status: 409,
          message: "Offer with this title already exists",
        };
      }
    }

    // 3️⃣ Discount validation
    if (discountValue !== undefined) {
      if (discountValue <= 0 || discountValue > 100) {
        return {
          success: false,
          status: 400,
          message: "discountValue must be between 1 and 100",
        };
      }
    }

    // 4️⃣ Date validation
    if (startDate && endDate) {
      if (new Date(startDate) >= new Date(endDate)) {
        return {
          success: false,
          status: 400,
          message: "Start date must be before end date",
        };
      }
    }

    // 5️⃣ SINGLE ACTIVE OFFER RULE
    if (isActive === true && offer.isActive === false) {
      // deactivate all other offers
      await prisma.offer.updateMany({
        where: {
          isActive: true,
          NOT: { id: offerId },
        },
        data: {
          isActive: false,
        },
      });
    }

    // 6️⃣ Update offer
    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: {
        title: title ?? offer.title,
        description: description ?? offer.description,
        ctaText: ctaText ?? offer.ctaText,
        discountValue:
          discountValue !== undefined ? discountValue : offer.discountValue,
        startDate: startDate ? new Date(startDate) : offer.startDate,
        endDate: endDate ? new Date(endDate) : offer.endDate,
        isActive: typeof isActive === "boolean" ? isActive : offer.isActive,
      },
    });

    return {
      success: true,
      status: 200,
      message: "Offer updated successfully",
      data: updatedOffer,
    };
  },

  // =========================
  // CREATE FAQ
  // =========================
  createFaq: async (prisma, data) => {
    const { category, question, answer, sortOrder = 0 } = data;

    // 1️⃣ Validation
    if (!category || !question || !answer) {
      return {
        success: false,
        status: 400,
        message: "category, question, and answer are required",
      };
    }

    // 2️⃣ Create FAQ
    const faq = await prisma.faq.create({
      data: {
        category,
        question,
        answer,
        sortOrder,
        isActive: true,
      },
    });

    return {
      success: true,
      status: 201,
      message: "FAQ created successfully",
      data: faq,
    };
  },

  // =========================
  // UPDATE FAQ
  // =========================
  updateFaq: async (prisma, faqId, data) => {
    const { question, answer, sortOrder } = data;

    // 1️⃣ Check FAQ exists
    const faq = await prisma.faq.findUnique({
      where: { id: faqId },
    });

    if (!faq) {
      return {
        success: false,
        status: 404,
        message: "FAQ not found",
      };
    }

    // 2️⃣ Validation
    if (!question && !answer && sortOrder === undefined) {
      return {
        success: false,
        status: 400,
        message: "Nothing to update",
      };
    }

    // 3️⃣ Update FAQ
    const updatedFaq = await prisma.faq.update({
      where: { id: faqId },
      data: {
        question: question ?? faq.question,
        answer: answer ?? faq.answer,
        sortOrder: sortOrder !== undefined ? sortOrder : faq.sortOrder,
      },
    });

    return {
      success: true,
      status: 200,
      message: "FAQ updated successfully",
      data: updatedFaq,
    };
  },

  // =========================
  // DELETE FAQ
  // =========================
  deleteFaq: async (prisma, faqId) => {
    // 1️⃣ Check FAQ exists
    const faq = await prisma.faq.findUnique({
      where: { id: faqId },
    });

    if (!faq) {
      return {
        success: false,
        status: 404,
        message: "FAQ not found",
      };
    }

    // 2️⃣ Delete FAQ
    await prisma.faq.delete({
      where: { id: faqId },
    });

    return {
      success: true,
      status: 200,
      message: "FAQ deleted successfully",
    };
  },

  // =========================
  // GET ALL FAQ (ADMIN)
  // =========================
  getAllFaqs: async (prisma) => {
    return prisma.faq.findMany({
      orderBy: [
        { category: "asc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    });
  },

  // =========================
  // GET FAQ BY CATEGORY (ADMIN)
  // =========================
  getFaqsByCategory: async (prisma, category) => {
    // 1️⃣ Validation
    if (!category) {
      return {
        success: false,
        status: 400,
        message: "Category is required",
      };
    }

    // 2️⃣ Fetch FAQs
    const faqs = await prisma.faq.findMany({
      where: {
        category,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return {
      success: true,
      status: 200,
      data: faqs,
    };
  },

  // =========================
  // DASHBOARD OVERVIEW (MERGED)
  // =========================
  getDashboardOverview: async (prisma) => {
    try {
      const [
        totalUsers,
        activeSubscribersCount,
        totalEssays,
        activeSubscriptions,
        subscriptions,
      ] = await Promise.all([
        prisma.user.count({
          where: {
            role: "STUDENT",
            isDeleted: false,
          },
        }),

        prisma.subscription.count({
          where: {
            status: "active",
          },
        }),

        prisma.essay.count(),

        prisma.subscription.findMany({
          where: {
            status: "active",
          },
          include: {
            plan: {
              select: {
                monthlyPrice: true,
              },
            },
          },
        }),

        prisma.subscription.findMany({
          where: { status: "active" },
          include: { plan: true },
        }),
      ]);

      // ===== Monthly Revenue =====
      const monthlyRevenue = activeSubscriptions.reduce(
        (sum, sub) => sum + (sub.plan?.monthlyPrice || 0),
        0,
      );

      // ===== Subscription Summary (Donut) =====
      const map = new Map();

      for (const sub of subscriptions) {
        const planId = sub.plan?.id;
        const planName = sub.plan?.name || "Unknown";

        if (!map.has(planName)) {
          map.set(planName, { planId, count: 0 });
        }

        map.get(planName).count += 1;
      }

      const totalSubscribers = subscriptions.length;

      let subscriptionData = Array.from(map.entries()).map(([name, obj]) => ({
        planId: obj.planId,
        name,
        count: obj.count,
        percentage:
          totalSubscribers > 0
            ? Math.round((obj.count / totalSubscribers) * 100)
            : 0,
      }));

      // Stable UI
      subscriptionData.sort((a, b) => b.count - a.count);

      return {
        success: true,
        status: 200,
        data: {
          summary: {
            totalUsers,
            activeSubscribers: activeSubscribersCount,
            monthlyRevenue,
            totalEssays,
          },
          subscriptionSummary: {
            totalSubscribers,
            data: subscriptionData,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        status: 500,
        message: "Failed to fetch dashboard overview",
      };
    }
  },

  // =========================
  // SALES TRACK (OPTIMIZED)
  // =========================
  getSalesTrack: async (prisma, type = "day") => {
    const now = new Date();
    let startDate;
    let groupBy;

    if (type === "day") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 6); // last 7 days
      groupBy = "day";
    } else if (type === "week") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 28); // last 4 weeks
      groupBy = "week";
    } else if (type === "month") {
      startDate = new Date();
      startDate.setMonth(now.getMonth() - 5); // last 6 months
      groupBy = "month";
    } else {
      return {
        success: false,
        status: 400,
        message: "Invalid type. Use day, week, or month",
      };
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        plan: true,
      },
    });

    const map = new Map();

    const formatKey = (date) => {
      const d = new Date(date);

      if (groupBy === "day") {
        return d.toISOString().split("T")[0]; // YYYY-MM-DD
      }

      if (groupBy === "week") {
        const firstDayOfWeek = new Date(d);
        firstDayOfWeek.setDate(d.getDate() - d.getDay());
        return firstDayOfWeek.toISOString().split("T")[0];
      }

      if (groupBy === "month") {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0",
        )}`;
      }
    };

    // Aggregate revenue
    for (const sub of subscriptions) {
      const key = formatKey(sub.createdAt);
      const revenue = sub.plan?.monthlyPrice || 0;

      if (!map.has(key)) {
        map.set(key, 0);
      }

      map.set(key, map.get(key) + revenue);
    }

    // Fill missing dates
    const result = [];
    const cursor = new Date(startDate);

    while (cursor <= now) {
      let key;

      if (groupBy === "day") {
        key = cursor.toISOString().split("T")[0];
        cursor.setDate(cursor.getDate() + 1);
      } else if (groupBy === "week") {
        key = cursor.toISOString().split("T")[0];
        cursor.setDate(cursor.getDate() + 7);
      } else if (groupBy === "month") {
        key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(
          2,
          "0",
        )}`;
        cursor.setMonth(cursor.getMonth() + 1);
      }

      result.push({
        label: key,
        value: map.get(key) || 0,
      });
    }

    return {
      success: true,
      status: 200,
      type,
      range:
        type === "day"
          ? "Last 7 days"
          : type === "week"
            ? "Last 4 weeks"
            : "Last 6 months",
      data: result,
    };
  },

  // =========================
  // GET REVENUE ANALYTICS (MONTHLY + YEARLY)
  // =========================
  getRevenueAnalytics: async (prisma) => {
    const now = new Date();

    // =========================
    // MONTHLY (group by week)
    // =========================
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlySubs = await prisma.subscription.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        plan: { select: { monthlyPrice: true } },
      },
    });

    const weeks = [0, 0, 0, 0, 0];

    monthlySubs.forEach((sub) => {
      const day = sub.createdAt.getDate();
      const weekIndex = Math.floor((day - 1) / 7);
      weeks[weekIndex] += sub.plan?.monthlyPrice || 0;
    });

    const monthly = {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
      data: weeks,
    };

    // =========================
    // YEARLY (group by month)
    // =========================
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);

    const yearlySubs = await prisma.subscription.findMany({
      where: {
        createdAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      include: {
        plan: { select: { monthlyPrice: true } },
      },
    });

    const months = Array(12).fill(0);

    yearlySubs.forEach((sub) => {
      const monthIndex = sub.createdAt.getMonth();
      months[monthIndex] += sub.plan?.monthlyPrice || 0;
    });

    const yearly = {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      data: months,
    };

    return {
      success: true,
      status: 200,
      data: {
        monthly,
        yearly,
      },
    };
  },

  // =========================
  // ANALYTICS OVERVIEW
  // =========================
  getAnalyticsOverview: async (prisma) => {
    const now = new Date();

    // =========================
    // 1️⃣ DAILY ESSAY GENERATION
    // =========================
    const essayStartDate = new Date();
    essayStartDate.setDate(now.getDate() - 6);
    essayStartDate.setHours(0, 0, 0, 0);

    const essays = await prisma.essay.findMany({
      where: {
        createdAt: {
          gte: essayStartDate,
          lte: now,
        },
      },
      select: { createdAt: true },
    });

    const essayMap = new Map();

    essays.forEach((essay) => {
      const key = essay.createdAt.toISOString().split("T")[0];
      essayMap.set(key, (essayMap.get(key) || 0) + 1);
    });

    const essayLabels = [];
    const essayData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);

      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      });

      essayLabels.push(label);
      essayData.push(essayMap.get(key) || 0);
    }

    // =========================
    // 2️⃣ ACTIVE USERS (THIS WEEK vs LAST WEEK)
    // =========================
    const startOfThisWeek = new Date();
    startOfThisWeek.setDate(now.getDate() - 6);
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date();
    startOfLastWeek.setDate(now.getDate() - 13);
    startOfLastWeek.setHours(0, 0, 0, 0);

    const endOfLastWeek = new Date();
    endOfLastWeek.setDate(now.getDate() - 7);
    endOfLastWeek.setHours(23, 59, 59, 999);

    const thisWeekUsers = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        status: "ACTIVE",
        isDeleted: false,
        createdAt: {
          gte: startOfThisWeek,
          lte: now,
        },
      },
      select: { createdAt: true },
    });

    const lastWeekUsers = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        status: "ACTIVE",
        isDeleted: false,
        createdAt: {
          gte: startOfLastWeek,
          lte: endOfLastWeek,
        },
      },
      select: { createdAt: true },
    });

    const buildChartData = (users, startDate) => {
      const map = new Map();

      users.forEach((u) => {
        const key = u.createdAt.toISOString().split("T")[0];
        map.set(key, (map.get(key) || 0) + 1);
      });

      const labels = [];
      const data = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);

        const key = d.toISOString().split("T")[0];
        const label = d.toLocaleDateString("en-US", { weekday: "short" });

        labels.push(label);
        data.push(map.get(key) || 0);
      }

      return { labels, data };
    };

    const thisWeek = buildChartData(thisWeekUsers, startOfThisWeek);
    const lastWeek = buildChartData(lastWeekUsers, startOfLastWeek);

    const thisWeekTotal = thisWeek.data.reduce((a, b) => a + b, 0);
    const lastWeekTotal = lastWeek.data.reduce((a, b) => a + b, 0);

    const percentageChange =
      lastWeekTotal === 0
        ? 100
        : Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);

    // =========================
    // 3️⃣ IMPRESSION ANALYTICS
    // =========================
    const impressionMap = new Map();

    essays.forEach((e) => {
      const key = e.createdAt.toISOString().split("T")[0];
      impressionMap.set(key, (impressionMap.get(key) || 0) + 1);
    });

    const impressionLabels = [];
    const impressionData = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(essayStartDate);
      d.setDate(d.getDate() + i);

      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      });

      impressionLabels.push(label);
      impressionData.push(impressionMap.get(key) || 0);
    }

    const totalImpressions = impressionData.reduce((a, b) => a + b, 0);

    // =========================
    // FINAL RESPONSE
    // =========================
    return {
      success: true,
      status: 200,
      data: {
        dailyEssayGeneration: {
          labels: essayLabels,
          data: essayData,
        },
        activeUsers: {
          labels: thisWeek.labels,
          thisWeek: thisWeek.data,
          lastWeek: lastWeek.data,
          comparison: {
            thisWeekTotal,
            lastWeekTotal,
            percentageChange,
          },
        },
        impressions: {
          labels: impressionLabels,
          data: impressionData,
          total: totalImpressions,
        },
      },
    };
  },
};

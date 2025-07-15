import { PrismaClient, UserRole, AuthProviderType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function seed() {
  const adminExists = await prisma.user.findUnique({
    where: { email: "admin@test.com" },
  });

  if (adminExists) {
    console.log("database seed already exist");
    return;
  }

  console.log("🌱 Seeding database...");

  const password = await bcrypt.hash("123456", 10);

  // ---------------------------
  // ADMIN
  // ---------------------------
  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      name: "System Admin",
      passwordHash: password,
      role: UserRole.ADMIN,
      status: "ACTIVE",
      isVerified: true,
      auths: {
        create: { provider: AuthProviderType.EMAIL },
      },
      settings: { create: {} },
    },
  });

  // ---------------------------
  // STUDENTS
  // ---------------------------
  const students = await Promise.all(
    ["student1@test.com", "student2@test.com", "student3@test.com"].map(
      async (email, index) => {
        return prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            name: `Student ${index + 1}`,
            passwordHash: password,
            role: UserRole.STUDENT,
            status: "ACTIVE",
            isVerified: true,
            isPlan: true,
            auths: {
              create: { provider: AuthProviderType.EMAIL },
            },
            studentSettings: {
              create: {
                fullName: `Student ${index + 1}`,
              },
            },
            settings: { create: {} },
          },
        });
      },
    ),
  );

  // ---------------------------
  // PLANS
  // ---------------------------
  const plansData = [
    { name: "essay_hack", price: 9.99 },
    { name: "essay_hack_plus", price: 19.99 },
    { name: "essay_hack_pro", price: 29.99 },
  ];

  const plans = [];

  for (const plan of plansData) {
    const createdPlan = await prisma.plan.upsert({
      where: { name: plan.name },
      update: {},
      create: {
        name: plan.name,
        description: "Scholarship essay AI plan",
        features: [
          "Unlimited Essays",
          "AI Voice Matching",
          "Deadline Tracking",
        ],
        monthlyPrice: plan.price,
        yearlyPrice: plan.price * 12,
        isActive: true,
      },
    });

    plans.push(createdPlan);
  }

  // ---------------------------
  // SUBSCRIPTIONS (1 plan per student)
  // ---------------------------
  for (let i = 0; i < 3; i++) {
    // 1️⃣ Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: students[i].id,
        planId: plans[i].id,
        status: "active",
        expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      },
    });

    // 2️⃣ Attach student to subscription
    await prisma.subscriptionStudent.create({
      data: {
        userId: students[i].id,
        subscriptionId: subscription.id,
        endDate: subscription.expiresAt,
      },
    });
  }

  console.log("✅ Seed completed");
  console.log("👮 Admin:", admin.email);
  console.log(
    "🎓 Students:",
    students.map((s) => s.email),
  );
  console.log(
    "📦 Plans:",
    plans.map((p) => p.name),
  );

  await prisma.$disconnect();
}

// Remove automatic execution here, it will be called from server.js
// seed()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

// import { PrismaClient, UserRole, AuthProviderType } from "@prisma/client";
// import bcrypt from "bcrypt";

// const prisma = new PrismaClient();

// async function main() {
//   console.log("🌱 Seeding database...");

//   // ---------------------------
//   // PASSWORDS
//   // ---------------------------
//   const studentPassword = await bcrypt.hash("student123", 10);
//   const adminPassword = await bcrypt.hash("admin123", 10);

//   // ---------------------------
//   // VERIFIED STUDENT
//   // ---------------------------
//   const student = await prisma.user.upsert({
//     where: { email: "student@test.com" },
//     update: {},
//     create: {
//       email: "student@test.com",
//       name: "Test Student",
//       passwordHash: studentPassword,
//       role: UserRole.STUDENT,
//       status: "ACTIVE",
//       isVerified: true,
//       auths: {
//         create: {
//           provider: AuthProviderType.EMAIL,
//         },
//       },
//       studentSettings: {
//         create: {
//           fullName: "Test Student",
//         },
//       },
//       settings: {
//         create: {},
//       },
//     },
//   });

//   // ---------------------------
//   // VERIFIED ADMIN
//   // ---------------------------
//   const admin = await prisma.user.upsert({
//     where: { email: "admin@test.com" },
//     update: {},
//     create: {
//       email: "admin@test.com",
//       name: "System Admin",
//       passwordHash: adminPassword,
//       role: UserRole.ADMIN,
//       status: "ACTIVE",
//       isVerified: true,
//       auths: {
//         create: {
//           provider: AuthProviderType.EMAIL,
//         },
//       },
//       settings: {
//         create: {},
//       },
//     },
//   });

//   // ---------------------------
//   // PLANS
//   // ---------------------------
//   const plans = [
//     {
//       name: "essay_hack_pro",
//       description: "Best plan for serious scholarship applicants",
//       features: [
//         "AI “Voice” Matching",
//         "Unlimited Revisions",
//         "Application Trackers",
//         "Deadline reminders",
//         "Unlimited Essays/Month",
//       ],
//       monthlyPrice: 29.99,
//       yearlyPrice: 359.88,
//       isActive: true,
//       sortOrder: 3,
//     },
//     {
//       name: "essay_hack_plus",
//       description: "Best plan for serious scholarship applicants",
//       features: [
//         "AI “Voice” Matching",
//         "Unlimited Revisions",
//         "Application Trackers",
//         "Deadline reminders",
//         "Unlimited Essays/Month",
//       ],
//       monthlyPrice: 19.99,
//       yearlyPrice: 239.88,
//       isActive: true,
//       sortOrder: 2,
//     },
//     {
//       name: "essay_hack",
//       description: "Best plan for serious scholarship applicants",
//       features: [
//         "AI “Voice” Matching",
//         "Unlimited Revisions",
//         "Application Trackers",
//         "Deadline reminders",
//         "Unlimited Essays/Month",
//       ],
//       monthlyPrice: 9.99,
//       yearlyPrice: 119.88,
//       isActive: true,
//       sortOrder: 1,
//     },
//   ];

//   for (const plan of plans) {
//     await prisma.plan.upsert({
//       where: { name: plan.name },
//       update: {
//         description: plan.description,
//         features: plan.features,
//         monthlyPrice: plan.monthlyPrice,
//         yearlyPrice: plan.yearlyPrice,
//         isActive: plan.isActive,
//         sortOrder: plan.sortOrder,
//       },
//       create: plan,
//     });
//   }

//   console.log("✅ Seeding completed successfully!");
//   console.log("👤 Student:", student.email);
//   console.log("👮 Admin:", admin.email);
// }

// main()
//   .catch((error) => {
//     console.error("❌ Seed failed:", error);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

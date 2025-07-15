import axios from "axios";
import fs from "fs";
import path from "path";
import { envVars } from "../../config/env.js";
import { QueryBuilder } from "../../utils/QueryBuilder.js";
import {
  essaySearchableFields,
  ESSAY_STATUS,
} from "./generateEssay.constant.js";

import FormData from "form-data";



export const EssayService = {

  // GET all essays by user
  getByUserId: async (prisma, userId, query) => {
    // 🛡️ Remove potential polluting fields from query
    const cleanQuery = { ...query };
    const systemFields = ["userId", "isDeleted", "status"];
    systemFields.forEach(f => delete cleanQuery[f]);

    const builder = new QueryBuilder(cleanQuery)
      .search([
        ...essaySearchableFields
      ])
      .filter({
        scholarship: ["type", "from"],
      })
      .sort("-createdAt", {
        scholarship: ["type", "from"],
      })
      .fields()
      .paginate();

    const prismaQuery = builder.build();

    // 🔥 ALWAYS force these core filters
    prismaQuery.where = {
      ...(prismaQuery.where || {}),
      userId,
      isDeleted: false,
      status: {
        in: [ESSAY_STATUS.SAVED, ESSAY_STATUS.EDITED]
      }
    };

    // Handle select/include conflict
    if (prismaQuery.select) {
      prismaQuery.select.scholarship = true;
    } else {
      prismaQuery.include = {
        scholarship: true,
      };
    }

    const data = await prisma.essay.findMany(prismaQuery);

    const total = await prisma.essay.count({
      where: prismaQuery.where,
    });

    return {
      data,
      meta: builder.getMeta(total),
    };
  },

  // GET single essay
  getById: async (prisma, id, userId) => {
    return prisma.essay.findFirst({
      where: {
        id,
        userId,
        isDeleted: false,
      },
    });
  },

  // CREATE prompt first
  createPrompt: async (prisma, data) => {
    return prisma.essay.create({
      data: {
        ...data,
        status: data.status || ESSAY_STATUS.GENERATING,
        voiceUrl: data.voiceUrl || null,
        documentUrls: data.documentUrls || [],
        voiceFilePath: data.voiceFilePath || null,
        documentFilePath: data.documentFilePath || [],
        isDeleted: false,
      },
    });
  },

  // UPDATE essay (AI or edit)
  updateEssay: async (prisma, id, userId, data) => {
    const essay = await prisma.essay.findFirst({
      where: {
        id,
        userId,
        isDeleted: false,
      },
    });

    if (!essay) {
      const error = new Error("Essay not found or not authorized");
      error.statusCode = 404;
      throw error;
    }

    return prisma.essay.update({
      where: { id },
      data,
    });
  },

  // SAVE essay (Change status from GENERATING to SAVED)
  saveEssay: async (prisma, id, userId) => {
    const essay = await prisma.essay.findFirst({
      where: {
        id,
        userId,
        isDeleted: false,
      },
    });

    if (!essay) {
      const error = new Error("Essay not found or not authorized");
      error.statusCode = 404;
      throw error;
    }

    if (essay.status !== ESSAY_STATUS.GENERATING) {
      const error = new Error(`Essay is already in ${essay.status} status`);
      error.statusCode = 400;
      throw error;
    }

    return prisma.essay.update({
      where: { id },
      data: {
        status: ESSAY_STATUS.SAVED,
      },
    });
  },

  // UPDATE essay content (USER EDIT)
  updateEssayContent: async (prisma, id, userId, contentFinal) => {
    const result = await prisma.essay.updateMany({
      where: {
        id,
        userId,
        isDeleted: false,
      },
      data: {
        contentFinal,
        wordCount: contentFinal.trim().split(/\s+/).length,
        status: ESSAY_STATUS.EDITED,
        updatedAt: new Date(),
      },
    });

    if (result.count === 0) {
      const error = new Error("Essay not found or not authorized");
      error.statusCode = 404;
      throw error;
    }

    return result;
  },

  // HARD DELETE essay
  delete: async (prisma, id, userId) => {
    const essay = await prisma.essay.findFirst({
      where: {
        id,
        userId,
        isDeleted: false,
      },
    });

    if (!essay) {
      const error = new Error("Essay not found or not authorized");
      error.statusCode = 404;
      throw error;
    }

    return prisma.essay.delete({
      where: { id },
    });
  },

  // AI CALL (Updated Sig: userId, prompt, audioPath, filePath)
  generateEssayByAI: async (userId, prompt, voicePath = null, documentPath = null) => {
    try {
      console.log("🚀 Forwarding to AI Service...");
      console.log("- User ID:", userId);
      console.log("- Prompt length:", prompt?.length || 0);

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("prompt", prompt || "");

      // 1️⃣ Attach local voice file (if exists)
      if (voicePath && fs.existsSync(voicePath)) {
        const absoluteVoicePath = path.resolve(voicePath);
        console.log(`- Attaching local audio: ${absoluteVoicePath}`);
        formData.append(
          "audio",
          fs.createReadStream(absoluteVoicePath),
          path.basename(absoluteVoicePath)
        );
      }

      // 2️⃣ Attach local document file(s)
      if (Array.isArray(documentPath)) {
        for (const docPath of documentPath) {
          if (!fs.existsSync(docPath)) {
            console.warn(`- Skipping missing document: ${path.resolve(docPath)}`);
            continue;
          }

          const absoluteDocPath = path.resolve(docPath);
          console.log(`- Attaching local file: ${absoluteDocPath}`);
          formData.append(
            "file",
            fs.createReadStream(absoluteDocPath),
            path.basename(absoluteDocPath)
          );
        }
      } else if (documentPath && fs.existsSync(documentPath)) {
        const absoluteDocPath = path.resolve(documentPath);
        console.log(`- Attaching local file: ${absoluteDocPath}`);
        formData.append(
          "file",
          fs.createReadStream(absoluteDocPath),
          path.basename(absoluteDocPath)
        );
      }

      const baseUrl = envVars.AI_SERVICE_URL.replace(/\/$/, "");
      const url = `${baseUrl}/${userId}`;

      console.log(`🚀 Sending POST request to AI Service: ${url}`);

      const response = await axios.post(
        url,
        formData,
        {
          headers: {
            ...formData.getHeaders(), // ✅ REQUIRED
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      console.log("✅ AI Service Response received");
      console.log("Status:", response.status);
      console.log("Data keys:", response.data ? Object.keys(response.data) : "No data");

      return response.data;

    } catch (error) {
      console.error("❌ AI Service Communication Error:", error.message);
      if (error.response) {
        console.error("Response Status:", error.response.status);
        console.error("Response Data:", JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  },


  // 🛡️ VALIDATE profile completion
  validateProfileCompletion: async (prisma, userId) => {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        basicInformation: true,
        academicInterest: true,
        extraCurricularsActivity: true,
        volunteerWork: true,
        familyBackground: true,
        uniqueExperience: true,
        diversityIdentity: true,
        scholarshipSpecificInfo: true,
        essaySpecificQuestions: true,
      },
    });

    if (!profile) {
      const error = new Error("Please complete your profile first.");
      error.statusCode = 400;
      throw error;
    }

    const sections = [
      { name: "Basic Information", data: profile.basicInformation },
      { name: "Academic Interest", data: profile.academicInterest },
      { name: "Extra Curriculars Activity", data: profile.extraCurricularsActivity },
      { name: "Volunteer Work", data: profile.volunteerWork },
      { name: "Family Background", data: profile.familyBackground },
      { name: "Unique Experience", data: profile.uniqueExperience },
      { name: "Diversity Identity", data: profile.diversityIdentity },
      { name: "Scholarship Specific Info", data: profile.scholarshipSpecificInfo },
      { name: "Essay Specific Questions", data: profile.essaySpecificQuestions },
    ];

    const missingSections = sections
      .filter((s) => !s.data)
      .map((s) => s.name);

    if (missingSections.length > 0) {
      const error = new Error(
        `Please complete the following profile sections: ${missingSections.join(", ")}`
      );
      error.statusCode = 400;
      throw error;
    }

    return profile;
  },
};


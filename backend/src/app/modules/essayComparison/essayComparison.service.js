import axios from "axios";
import { envVars } from "../../config/env.js";

/**
 * Normalize escaped newlines just in case AI returns \\n
 */
const normalizeText = (text = "") => {
  if (typeof text !== "string") return text;
  return text.replace(/\\n/g, "\n");
};

export const EssayComparisonService = {
  // CALL AI COMPARE API

  compareEssaysByAI: async (essayA, essayB) => {
    console.log("🚀 STARTING ESSAY COMPARISON...");
    console.log("Essay A ID:", essayA?.id || "N/A");
    console.log("Essay B ID:", essayB?.id || "N/A");

    const response = await axios.post(
      envVars.AI_ESSAY_COMPARE_API_URL,
      {
        essayA,
        essayB,
      },
      {
        timeout: 60000,
        validateStatus: (status) => status < 500, // 👈 allow 4xx to be handled cleanly
      }
    );

    console.log("🚀 AI COMPARE RESPONSE STATUS:", response.status);
    console.log("🚀 AI COMPARE DATA:", JSON.stringify(response.data, null, 2));



    if (response.status !== 200) {
      throw new Error(`AI compare API failed with status ${response.status}`);
    }

    return {
      essayA: {
        score: response.data.essayA.score,
        strengths: normalizeText(response.data.essayA.strengths),
        improvements: normalizeText(response.data.essayA.improvements),
      },
      essayB: {
        score: response.data.essayB.score,
        strengths: normalizeText(response.data.essayB.strengths),
        improvements: normalizeText(response.data.essayB.improvements),
      },
      comparison: response.data.comparison,
    };
  },

  // SAVE COMPARISON

  create: async (prisma, data) => {
    return prisma.essayComparison.create({ data });
  },

  // GET HISTORY

  getByUserId: async (prisma, userId) => {
    return prisma.essayComparison.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        essayA: { select: { id: true, title: true } },
        essayB: { select: { id: true, title: true } },
      },
    });
  },

  // GET SINGLE RESULT

  getById: async (prisma, id, userId) => {
    return prisma.essayComparison.findFirst({
      where: { id, userId },
      include: {
        essayA: { select: { id: true, title: true } },
        essayB: { select: { id: true, title: true } },
      },
    });
  },
};

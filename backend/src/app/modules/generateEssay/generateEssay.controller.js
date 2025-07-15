import { StatusCodes } from "http-status-codes";
import { EssayService } from "./generateEssay.service.js";
import { normalizeEssayText } from "../../utils/normalizeEssayText.js";
import { toHtml } from "../../utils/toHtml.js";
import { ESSAY_STATUS } from "./generateEssay.constant.js";
import { SubscriptionStudentService } from "../subscriptionStudent/subscriptionStudent.service.js";
import { envVars } from "../../config/env.js";


// CREATE + AI GENERATE

import fs from "fs";
import path from "path";


const createEssay = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;
    const { subject, title, prompt, scholarshipId } = req.body;

    /* ----------------------------------------------------
       1. Collect uploaded files safely
    ---------------------------------------------------- */
    const voiceFiles = [];
    const documentFiles = [];
    const voiceUrls = [];
    const documentUrls = [];

    if (req.files && typeof req.files === "object") {
      const allFiles = Object.values(req.files).flat();

      for (const file of allFiles) {
        // Standard relative path for Database (e.g., uploads/essays/file.pdf)
        const relativePath = `uploads/essays/${file.filename}`;

        const fileUrl = `${envVars.SERVER_URL}/${relativePath}`;

        if (["voice", "audio"].includes(file.fieldname)) {
          voiceFiles.push(relativePath);
          voiceUrls.push(fileUrl);
        }

        if (["documents", "document", "file", "files"].includes(file.fieldname)) {
          documentFiles.push(relativePath);
          documentUrls.push(fileUrl);
        }
      }
    }

    const voicePath = voiceFiles[0] || null;
    const voiceUrl = voiceUrls[0] || null;

    /* ----------------------------------------------------
       2. Input validation
    ---------------------------------------------------- */
    if (!prompt && !voicePath && documentFiles.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Provide a prompt, voice/audio file, or document file.",
      });
    }

    /* ----------------------------------------------------
       3. Validate files exist on disk (safety)
    ---------------------------------------------------- */
    if (voicePath && !fs.existsSync(voicePath)) {
      throw new Error("Uploaded voice file not found on server");
    }

    for (const doc of documentFiles) {
      if (!fs.existsSync(doc)) {
        throw new Error("One or more document files are missing on server");
      }
    }

    /* ----------------------------------------------------
       4. Business validations
    ---------------------------------------------------- */
    const profile = await EssayService.validateProfileCompletion(prisma, userId);
    await SubscriptionStudentService.validateEssayLimit(prisma, userId);

    /* ----------------------------------------------------
       5. Create initial essay record
    ---------------------------------------------------- */
    const essay = await EssayService.createPrompt(prisma, {
      userId,
      subject,
      title,
      prompt: prompt || "Multi-modal essay generation",
      voiceFilePath: voicePath,
      documentFilePath: documentFiles,
      voiceUrl: voiceUrl,
      documentUrls: documentUrls,
      userProfileId: profile.id,
      scholarshipId: scholarshipId || null,
      status: ESSAY_STATUS.GENERATING,
    });

    /* ----------------------------------------------------
       6. AI generation
    ---------------------------------------------------- */
    try {
      const aiResponse = await EssayService.generateEssayByAI(
        userId,
        prompt || "Generate an essay based on the provided files.",
        voicePath,
        documentFiles
      );

      if (!aiResponse?.essay) {
        throw new Error("AI returned empty essay content");
      }

      const cleanedContent = normalizeEssayText(aiResponse.essay);

      const updatedEssay = await EssayService.updateEssay(
        prisma,
        essay.id,
        userId,
        {
          contentFinal: cleanedContent,
          wordCount: cleanedContent.trim().split(/\s+/).length,
          status: ESSAY_STATUS.GENERATING, // Keep it generating until saved
        }
      );

      return res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Essay generated successfully. Please save it to keep it in your collection.",
        data: {
          ...updatedEssay,
          contentFinal: toHtml(updatedEssay.contentFinal),
        },
      });

    } catch (aiError) {
      console.error("AI Generation Error:", aiError);

      await EssayService.updateEssay(prisma, essay.id, userId, {
        status: ESSAY_STATUS.FAILED,
      });

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Essay generation failed",
        error: aiError.message,
      });
    }

  } catch (error) {
    next(error);
  }
};

export default createEssay;






// GET all essays

const getEssays = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;

    const result = await EssayService.getByUserId(prisma, userId, req.query);

    res.status(StatusCodes.OK).json({
      success: true,
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};


// GET single essay

const getEssayById = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;
    const { id } = req.params;

    const data = await EssayService.getById(prisma, id, userId);

    if (!data) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Essay not found",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};




// EDIT essay text (USER)

const updateEssayContent = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;
    const { id } = req.params;
    let { contentFinal } = req.body;

    if (!contentFinal) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Essay content is required",
      });
    }

    // Normalize content (handling backslashes/escaped characters)
    const cleanedContent = normalizeEssayText(contentFinal);

    const result = await EssayService.updateEssayContent(
      prisma,
      id,
      userId,
      cleanedContent
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Essay updated successfully",
      data: {
        contentFinal: toHtml(cleanedContent)
      }
    });
  } catch (error) {
    next(error);
  }
};



// DELETE essay

const deleteEssay = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;
    const { id } = req.params;

    await EssayService.delete(prisma, id, userId);

    res.status(200).json({
      success: true,
      message: "Essay deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


// SAVE essay
const saveEssay = async (req, res, next) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;
    const { id } = req.params;

    const result = await EssayService.saveEssay(prisma, id, userId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Essay saved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const EssayController = {
  getEssays,
  getEssayById,
  createEssay,
  updateEssayContent,
  deleteEssay,
  saveEssay,
};

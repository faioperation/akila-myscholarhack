import { ScholarshipInterestService } from "./scholarshipInterest.service.js";

const upsertScholarshipInterest = async (req, res) => {
    try {
        const prisma = req.prisma;
        const { userProfileId, ...data } = req.body;

        if (!userProfileId) {
            return res.status(400).json({ success: false, message: "userProfileId required" });
        }

        const result = await ScholarshipInterestService.upsert(prisma, userProfileId, data);

        return res.json({
            success: true,
            message: "Scholarship preferences saved successfully",
            data: result,
        });
    } catch (error) {
        console.error("upsertScholarshipInterest error:", error);
        return res.status(500).json({ success: false, message: "Failed to save scholarship preferences" });
    }
};

const getScholarshipInterest = async (req, res) => {
    try {
        const prisma = req.prisma;
        const { userProfileId } = req.params;

        const result = await ScholarshipInterestService.findByProfileId(prisma, userProfileId);

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("getScholarshipInterest error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch scholarship preferences" });
    }
};

export const ScholarshipInterestController = {
    upsertScholarshipInterest,
    getScholarshipInterest,
};

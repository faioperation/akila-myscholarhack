import prisma from "../../prisma/client.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { StudentReviewService } from "./studentReview.service.js";

const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewData = req.body;

    const response = await StudentReviewService.createReview(prisma, reviewData, userId);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Review created successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to create review",
      data: { error: error.message },
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const reviewData = req.body;

    const response = await StudentReviewService.updateReview(prisma, id, userId, reviewData);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Review updated successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to update review",
      data: { error: error.message },
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;

    const response = await StudentReviewService.deleteReview(prisma, id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Review deleted successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to delete review",
      data: { error: error.message },
    });
  }
};

const getSingleReview = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await StudentReviewService.getSingleReview(prisma, id);

    if (!response) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Review not found",
        data: null,
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Review fetched successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch review",
      data: { error: error.message },
    });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const response = await StudentReviewService.getAllReviews(prisma);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Reviews fetched successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch reviews",
      data: { error: error.message },
    });
  }
};

export const StudentReviewController = {
  createReview,
  updateReview,
  deleteReview,
  getSingleReview,
  getAllReviews,
};

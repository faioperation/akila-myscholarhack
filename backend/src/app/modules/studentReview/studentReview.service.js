const createReview = async (prisma, reviewData, userId) => {
  const newReview = await prisma.studentReview.create({
    data: {
      userId: userId,
      reviewText: reviewData.reviewText,
      rating: reviewData.rating,
    },
  });
  return newReview;
};

const updateReview = async (prisma, id, userId, reviewData) => {
  const updatedReview = await prisma.studentReview.update({
    where: {
      id,
      userId, // Ensure the user owns the review
    },
    data: {
      reviewText: reviewData.reviewText,
      rating: reviewData.rating,
    },
  });
  return updatedReview;
};

const deleteReview = async (prisma, id, userId) => {
  const deletedReview = await prisma.studentReview.delete({
    where: {
      id,
      userId, // Ensure the user owns the review
    },
  });
  return deletedReview;
};

const getSingleReview = async (prisma, id) => {
  const review = await prisma.studentReview.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          picture: true,
        },
      },
    },
  });
  return review;
};

const getAllReviews = async (prisma) => {
  const reviews = await prisma.studentReview.findMany({
    include: {
      user: {
        select: {
          name: true,
          picture: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return reviews;
};

export const StudentReviewService = {
  createReview,
  updateReview,
  deleteReview,
  getSingleReview,
  getAllReviews,
};
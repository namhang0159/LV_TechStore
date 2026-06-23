const db = require("../models");

const getProductReviewsService = async (productId) => {
  try {
    const reviews = await db.Review.findAll({
      where: { product_id: productId, status: "approved" },
      include: [
        {
          model: db.User,
          attributes: ['id', 'name', 'email'] // exclude passwords
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return {
      success: true,
      data: reviews,
    };
  } catch (error) {
    throw new Error("Error fetching reviews: " + error.message);
  }
};

const createReviewService = async (userId, productId, orderId, rating, comment) => {
  try {
    const product = await db.Product.findByPk(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const existingReview = await db.Review.findOne({
      where: {
        order_id: orderId,
        product_id: productId
      }
    });

    if (existingReview) {
      throw new Error("You have already reviewed this product for this order");
    }

    const newReview = await db.Review.create({
      product_id: productId,
      user_id: userId,
      order_id: orderId,
      rating: rating,
      comment: comment,
      status: "pending", // default to pending for moderation
      created_at: new Date()
    });

    return {
      success: true,
      message: "Review submitted successfully",
      data: newReview,
    };
  } catch (error) {
    throw new Error("Error creating review: " + error.message);
  }
};

const getAllReviewsAdminService = async () => {
  try {
    const reviews = await db.Review.findAll({
      include: [
        {
          model: db.User,
          attributes: ['id', 'name', 'email']
        },
        {
          model: db.Product,
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return {
      success: true,
      data: reviews,
    };
  } catch (error) {
    throw new Error("Error fetching reviews for admin: " + error.message);
  }
};

const updateReviewStatusService = async (reviewId, status) => {
  try {
    const review = await db.Review.findByPk(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new Error("Invalid status");
    }

    review.status = status;
    await review.save();

    return {
      success: true,
      message: "Review status updated successfully",
      data: review,
    };
  } catch (error) {
    throw new Error("Error updating review status: " + error.message);
  }
};

const deleteReviewService = async (reviewId) => {
  try {
    const review = await db.Review.findByPk(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    await review.destroy();

    return {
      success: true,
      message: "Review deleted successfully",
    };
  } catch (error) {
    throw new Error("Error deleting review: " + error.message);
  }
};

module.exports = {
  getProductReviewsService,
  createReviewService,
  getAllReviewsAdminService,
  updateReviewStatusService,
  deleteReviewService,
};

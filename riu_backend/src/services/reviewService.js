const db = require("../models");

const getProductReviewsService = async (productId) => {
  try {
    const reviews = await db.Review.findAll({
      where: { product_id: productId, status: "approved" },
      include: [
        {
          model: db.User,
          attributes: ['id', 'username', 'email'] // exclude passwords
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

const createReviewService = async (userId, productId, rating, comment) => {
  try {
    const product = await db.Product.findByPk(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const newReview = await db.Review.create({
      product_id: productId,
      user_id: userId,
      rating: rating,
      comment: comment,
      status: "approved", // default to approved for now, or "pending" if moderation needed
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

module.exports = {
  getProductReviewsService,
  createReviewService,
};

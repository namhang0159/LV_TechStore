const reviewService = require("../services/reviewService");

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await reviewService.getProductReviewsService(productId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, rating, comment } = req.body;
    const result = await reviewService.createReviewService(userId, product_id, rating, comment);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProductReviews,
  createReview,
};

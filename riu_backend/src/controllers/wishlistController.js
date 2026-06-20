const wishlistService = require("../services/wishlistService");

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await wishlistService.getWishlistService(userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;
    const result = await wishlistService.addToWishlistService(userId, product_id);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const result = await wishlistService.removeFromWishlistService(userId, productId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};

const cartService = require("../services/cartService");

const getCart = async (req, res) => {
  try {
    // Assuming authMiddleware sets req.user
    const userId = req.user.id; 
    const result = await cartService.getCartService(userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { variant_id, quantity } = req.body;
    const result = await cartService.addToCartService(userId, variant_id, quantity);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;
    const result = await cartService.updateCartItemService(userId, itemId, quantity);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const result = await cartService.removeFromCartService(userId, itemId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await cartService.clearCartService(userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateVariantCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, newVariantId } = req.body;
    const result = await cartService.updateVariantCartService(userId, itemId, newVariantId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  updateVariantCart,
};

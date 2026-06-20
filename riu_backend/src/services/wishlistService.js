const db = require("../models");

const getWishlistService = async (userId) => {
  try {
    const wishlist = await db.Wishlist.findAll({
      where: { user_id: userId },
      include: [
        {
          model: db.Product,
          attributes: ['id', 'name', 'slug', 'base_price', 'status'], // Optimized payload
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return {
      success: true,
      data: wishlist,
    };
  } catch (error) {
    throw new Error("Error fetching wishlist: " + error.message);
  }
};

const addToWishlistService = async (userId, productId) => {
  try {
    // Check if product exists
    const product = await db.Product.findByPk(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check if already in wishlist
    const existing = await db.Wishlist.findOne({
      where: { user_id: userId, product_id: productId }
    });

    if (existing) {
      return { success: true, message: "Product already in wishlist", data: existing };
    }

    const wishlistItem = await db.Wishlist.create({
      user_id: userId,
      product_id: productId,
      created_at: new Date()
    });

    return {
      success: true,
      message: "Added to wishlist",
      data: wishlistItem,
    };
  } catch (error) {
    throw new Error("Error adding to wishlist: " + error.message);
  }
};

const removeFromWishlistService = async (userId, productId) => {
  try {
    const deleted = await db.Wishlist.destroy({
      where: { user_id: userId, product_id: productId }
    });

    if (deleted === 0) {
      throw new Error("Product not found in wishlist");
    }

    return {
      success: true,
      message: "Removed from wishlist",
    };
  } catch (error) {
    throw new Error("Error removing from wishlist: " + error.message);
  }
};

module.exports = {
  getWishlistService,
  addToWishlistService,
  removeFromWishlistService,
};

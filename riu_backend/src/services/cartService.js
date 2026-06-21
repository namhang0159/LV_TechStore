const db = require("../models");

const getCartService = async (userId) => {
  try {
    let cart = await db.Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: db.CartItem,
          include: [
            {
              model: db.ProductVariant,
              include: [
                { model: db.Product },
                { model: db.ProductVariantImage, attributes: ['id', 'image_url'] },
                {
                  model: db.AttributeValue,
                  include: [{ model: db.Attribute, attributes: ['id', 'name'] }]
                },
                {
                  model: db.Inventory,
                  attributes: ["warehouse_id", "quantity", "reserved_quantity"],
                  required: false,
                }
              ]
            }
          ]
        }
      ]
    });

    if (!cart) {
      cart = await db.Cart.create({ user_id: userId, created_at: new Date() });
      cart.CartItems = []; // Add empty items array for consistency
    }

    return {
      success: true,
      data: cart,
    };
  } catch (error) {
    throw new Error("Error fetching cart: " + error.message);
  }
};

const addToCartService = async (userId, variantId, quantity) => {
  try {
    // Find or create cart
    let cart = await db.Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      cart = await db.Cart.create({ user_id: userId, created_at: new Date() });
    }

    // Check if variant exists
    const variant = await db.ProductVariant.findByPk(variantId);
    if (!variant) {
      throw new Error("Product variant not found");
    }

    // Check if item already in cart
    let cartItem = await db.CartItem.findOne({
      where: { cart_id: cart.id, variant_id: variantId }
    });

    if (cartItem) {
      // Update quantity
      await cartItem.update({ quantity: cartItem.quantity + quantity });
    } else {
      // Create new cart item
      cartItem = await db.CartItem.create({
        cart_id: cart.id,
        variant_id: variantId,
        quantity: quantity || 1
      });
    }

    return {
      success: true,
      message: "Item added to cart",
      data: cartItem,
    };
  } catch (error) {
    throw new Error("Error adding to cart: " + error.message);
  }
};

const updateCartItemService = async (userId, itemId, quantity) => {
  try {
    const cart = await db.Cart.findOne({ where: { user_id: userId } });
    if (!cart) throw new Error("Cart not found");

    const cartItem = await db.CartItem.findOne({
      where: { id: itemId, cart_id: cart.id }
    });

    if (!cartItem) throw new Error("Cart item not found");

    if (quantity <= 0) {
      await cartItem.destroy();
      return { success: true, message: "Item removed from cart" };
    } else {
      await cartItem.update({ quantity: quantity });
      return { success: true, message: "Cart item updated", data: cartItem };
    }
  } catch (error) {
    throw new Error("Error updating cart item: " + error.message);
  }
};

const removeFromCartService = async (userId, itemId) => {
  try {
    const cart = await db.Cart.findOne({ where: { user_id: userId } });
    if (!cart) throw new Error("Cart not found");

    const cartItem = await db.CartItem.findOne({
      where: { id: itemId, cart_id: cart.id }
    });

    if (!cartItem) throw new Error("Cart item not found");

    await cartItem.destroy();

    return {
      success: true,
      message: "Item removed from cart",
    };
  } catch (error) {
    throw new Error("Error removing from cart: " + error.message);
  }
};

const clearCartService = async (userId) => {
  try {
    const cart = await db.Cart.findOne({ where: { user_id: userId } });
    if (!cart) throw new Error("Cart not found");

    await db.CartItem.destroy({ where: { cart_id: cart.id } });

    return {
      success: true,
      message: "Cart cleared successfully",
    };
  } catch (error) {
    throw new Error("Error clearing cart: " + error.message);
  }
};

const updateVariantCartService = async (userId, itemId, newVariantId) => {
  try {
    const cart = await db.Cart.findOne({ where: { user_id: userId } });
    if (!cart) throw new Error("Cart not found");

    const cartItem = await db.CartItem.findOne({
      where: { id: itemId, cart_id: cart.id }
    });

    if (!cartItem) throw new Error("Cart item not found");

    const variant = await db.ProductVariant.findByPk(newVariantId);
    if (!variant) {
      throw new Error("New product variant not found");
    }

    const existingItemWithNewVariant = await db.CartItem.findOne({
      where: { cart_id: cart.id, variant_id: newVariantId }
    });

    if (existingItemWithNewVariant && existingItemWithNewVariant.id !== cartItem.id) {
       await existingItemWithNewVariant.update({ quantity: existingItemWithNewVariant.quantity + cartItem.quantity });
       await cartItem.destroy();
       return { success: true, message: "Variant updated and merged", data: existingItemWithNewVariant };
    } else {
       await cartItem.update({ variant_id: newVariantId });
       return { success: true, message: "Cart item variant updated", data: cartItem };
    }
  } catch (error) {
    throw new Error("Error updating cart item variant: " + error.message);
  }
};

module.exports = {
  getCartService,
  addToCartService,
  updateCartItemService,
  removeFromCartService,
  clearCartService,
  updateVariantCartService,
};

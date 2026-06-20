const db = require("../models");

const activateWarrantyService = async (data) => {
  try {
    const { product_variant_id, user_id, order_id, purchase_date, warranty_months } = data;
    
    const purchaseDate = new Date(purchase_date || Date.now());
    const expiryDate = new Date(purchaseDate);
    expiryDate.setMonth(expiryDate.getMonth() + (warranty_months || 12));

    const warranty = await db.Warranty.create({
      product_variant_id,
      user_id,
      order_id,
      purchase_date: purchaseDate,
      expiry_date: expiryDate,
      status: "active"
    });

    return { success: true, message: "Warranty activated", data: warranty };
  } catch (error) {
    throw new Error("Error activating warranty: " + error.message);
  }
};

const getUserWarrantiesService = async (userId) => {
  try {
    const warranties = await db.Warranty.findAll({
      where: { user_id: userId },
      include: [
        { model: db.ProductVariant, include: [db.Product] }
      ]
    });
    return { success: true, data: warranties };
  } catch (error) {
    throw new Error("Error fetching warranties: " + error.message);
  }
};

module.exports = {
  activateWarrantyService,
  getUserWarrantiesService,
};

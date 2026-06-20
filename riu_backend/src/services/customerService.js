const db = require("../models");

const getAllCustomersService = async () => {
  try {
    const customers = await db.User.findAll({
      attributes: { exclude: ['password'] }
    });
    return { success: true, data: customers };
  } catch (error) {
    throw new Error("Error fetching customers: " + error.message);
  }
};

const getCustomerByIdService = async (id) => {
  try {
    const customer = await db.User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: db.UserAddress },
        { 
          model: db.Order,
          include: [
            {
              model: db.OrderItem,
              include: [
                {
                  model: db.ProductVariant,
                  include: [{ model: db.Product }]
                }
              ]
            }
          ]
        },
        {
          model: db.Wishlist,
          include: [{ model: db.Product }]
        },
        {
          model: db.Cart,
          include: [
            {
              model: db.CartItem,
              include: [
                {
                  model: db.ProductVariant,
                  include: [{ model: db.Product }]
                }
              ]
            }
          ]
        }
      ]
    });
    if (!customer) throw new Error("Customer not found");
    return { success: true, data: customer };
  } catch (error) {
    throw new Error("Error fetching customer: " + error.message);
  }
};

const updateCustomerStatusService = async (id, status) => {
  try {
    const customer = await db.User.findByPk(id);
    if (!customer) throw new Error("Customer not found");
    
    customer.status = status;
    await customer.save();
    
    return { success: true, message: "Customer status updated successfully", data: customer };
  } catch (error) {
    throw new Error("Error updating customer status: " + error.message);
  }
};

module.exports = {
  getAllCustomersService,
  getCustomerByIdService,
  updateCustomerStatusService
};

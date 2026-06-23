const db = require("../models");

const createVoucherService = async (data) => {
  try {
    const newVoucher = await db.Voucher.create({
      code: data.code,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      min_order_value: data.min_order_value || 0,
      max_discount: data.max_discount || null,
      min_level_points: data.min_level_points !== undefined ? data.min_level_points : 0,
      start_date: data.start_date,
      end_date: data.end_date,
      usage_limit: data.usage_limit || null,
      created_at: new Date()
    });
    return { success: true, message: "Voucher created", data: newVoucher };
  } catch (error) {
    throw new Error("Error creating voucher: " + error.message);
  }
};

const getAllVouchersService = async (userId) => {
  try {
    let userPoints = 0;
    let usedVoucherIds = [];
    if (userId) {
      const user = await db.User.findByPk(userId);
      if (user) userPoints = user.level_points || 0;

      const usedVouchers = await db.UserVoucher.findAll({
        where: { user_id: userId, is_used: true },
        attributes: ['voucher_id']
      });
      usedVoucherIds = usedVouchers.map(uv => uv.voucher_id);
    }

    let whereClause = {
      [db.Sequelize.Op.or]: [
        { min_level_points: null },
        { min_level_points: { [db.Sequelize.Op.lte]: userPoints } }
      ]
    };

    const now = new Date();
    whereClause.end_date = {
      [db.Sequelize.Op.or]: [
        { [db.Sequelize.Op.gte]: now },
        { [db.Sequelize.Op.is]: null }
      ]
    };

    whereClause.usage_limit = {
      [db.Sequelize.Op.or]: [
        { [db.Sequelize.Op.gt]: 0 },
        { [db.Sequelize.Op.is]: null }
      ]
    };

    if (usedVoucherIds.length > 0) {
      whereClause.id = { [db.Sequelize.Op.notIn]: usedVoucherIds };
    }

    const vouchers = await db.Voucher.findAll({
      where: whereClause
    });
    return { success: true, data: vouchers };
  } catch (error) {
    throw new Error("Error fetching vouchers: " + error.message);
  }
};
const getAllVouchersByAdminService = async () => {
  try {
    const vouchers = await db.Voucher.findAll({
      include: [
        {
          model: db.Order,
          attributes: ['id', 'order_code', 'final_amount', 'created_at'],
          through: { attributes: ['discount_amount'] },
          include: [
            {
              model: db.User,
              attributes: ['id', 'name', 'email', 'phone']
            },
            {
              model: db.OrderItem,
              attributes: ['id', 'product_name_snapshot', 'variant_name_snapshot', 'quantity', 'total_price', 'variant_id'],
              include: [
                {
                  model: db.ProductVariant,
                  attributes: ['id'],
                  include: [
                    {
                      model: db.Product,
                      attributes: ['id', 'name', 'slug']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    return { success: true, data: vouchers };
  } catch (error) {
    throw new Error("Error fetching vouchers: " + error.message);
  }
};
const saveUserVoucherService = async (userId, voucherId) => {
  try {
    const voucher = await db.Voucher.findByPk(voucherId);
    if (!voucher) throw new Error("Voucher not found");

    const user = await db.User.findByPk(userId);
    if (!user) throw new Error("User not found");

    if (voucher.min_level_points !== null && user.level_points < voucher.min_level_points) {
      throw new Error("Bạn không đủ điểm để lưu voucher này");
    }

    // Check if already saved
    const existing = await db.UserVoucher.findOne({
      where: { user_id: userId, voucher_id: voucherId }
    });

    if (existing) throw new Error("Voucher already saved");

    const userVoucher = await db.UserVoucher.create({
      user_id: userId,
      voucher_id: voucherId,
      is_used: false,
      saved_at: new Date()
    });

    return { success: true, message: "Voucher saved successfully", data: userVoucher };
  } catch (error) {
    throw new Error("Error saving voucher: " + error.message);
  }
};

const getVoucherByIdService = async (id) => {
  try {
    const voucher = await db.Voucher.findByPk(id);
    if (!voucher) throw new Error("Voucher not found");
    return { success: true, data: voucher };
  } catch (error) {
    throw new Error("Error fetching voucher: " + error.message);
  }
};

const getVoucherAdminByIdService = async (id) => {
  try {
    const voucher = await db.Voucher.findByPk(id, {
      include: [
        {
          model: db.Order,
          attributes: ['id', 'order_code', 'final_amount', 'created_at'],
          through: { attributes: ['discount_amount'] },
          include: [
            {
              model: db.User,
              attributes: ['id', 'name', 'email', 'phone']
            },
            {
              model: db.OrderItem,
              attributes: ['id', 'product_name_snapshot', 'variant_name_snapshot', 'quantity', 'total_price', 'variant_id'],
              include: [
                {
                  model: db.ProductVariant,
                  attributes: ['id'],
                  include: [
                    {
                      model: db.Product,
                      attributes: ['id', 'name', 'slug']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });
    if (!voucher) throw new Error("Voucher not found");
    return { success: true, data: voucher };
  } catch (error) {
    throw new Error("Error fetching voucher: " + error.message);
  }
};

const updateVoucherService = async (id, data) => {
  try {
    const voucher = await db.Voucher.findByPk(id);
    if (!voucher) throw new Error("Voucher not found");

    await voucher.update(data);
    return { success: true, message: "Voucher updated", data: voucher };
  } catch (error) {
    throw new Error("Error updating voucher: " + error.message);
  }
};

const deleteVoucherService = async (id) => {
  try {
    const voucher = await db.Voucher.findByPk(id);
    if (!voucher) throw new Error("Voucher not found");

    await voucher.destroy();
    return { success: true, message: "Voucher deleted" };
  } catch (error) {
    throw new Error("Error deleting voucher: " + error.message);
  }
};

const applyVoucherService = async (code, orderTotal, userId) => {
  try {
    const voucher = await db.Voucher.findOne({ where: { code } });
    if (!voucher) throw new Error("Invalid voucher code");

    let userPoints = 0;
    if (userId) {
      const user = await db.User.findByPk(userId);
      if (user) userPoints = user.level_points || 0;
    }

    if (voucher.min_level_points !== null && userPoints < voucher.min_level_points) {
      throw new Error("Bạn không đủ điểm để sử dụng voucher này");
    }

    if (userId) {
      const usedVoucher = await db.UserVoucher.findOne({
        where: { user_id: userId, voucher_id: voucher.id, is_used: true }
      });
      if (usedVoucher) {
        throw new Error("Bạn đã sử dụng voucher này rồi");
      }
    }

    const now = new Date();
    if (voucher.start_date && new Date(voucher.start_date) > now) {
      throw new Error("Voucher is not yet active");
    }
    if (voucher.end_date && new Date(voucher.end_date) < now) {
      throw new Error("Voucher has expired");
    }
    if (voucher.usage_limit !== null && voucher.usage_limit <= 0) {
      throw new Error("Voucher usage limit reached");
    }
    if (orderTotal < Number(voucher.min_order_value)) {
      throw new Error(`Minimum order value of ${voucher.min_order_value} required`);
    }

    let discountValue = 0;
    if (voucher.discount_type === "fixed") {
      discountValue = Number(voucher.discount_value);
    } else if (voucher.discount_type === "percentage") {
      discountValue = (orderTotal * Number(voucher.discount_value)) / 100;
      if (voucher.max_discount && discountValue > Number(voucher.max_discount)) {
        discountValue = Number(voucher.max_discount);
      }
    }

    return {
      success: true,
      data: {
        voucher_id: voucher.id,
        code: voucher.code,
        discount_amount: discountValue,
      }
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getMyVouchersService = async (userId) => {
  try {
    const userVouchers = await db.UserVoucher.findAll({
      where: { user_id: userId, is_used: false },
      include: [
        {
          model: db.Voucher,
          required: true
        }
      ]
    });
    return { success: true, data: userVouchers };
  } catch (error) {
    throw new Error("Error fetching user vouchers: " + error.message);
  }
};

module.exports = {
  createVoucherService,
  getAllVouchersService,
  saveUserVoucherService,
  getVoucherByIdService,
  getVoucherAdminByIdService,
  updateVoucherService,
  deleteVoucherService,
  applyVoucherService,
  getMyVouchersService,
  getAllVouchersByAdminService,
};

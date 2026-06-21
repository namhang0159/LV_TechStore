const { Order, OrderItem, Warehouse, Warranty, OrderItemSerial, SerialNumber, ProductVariant, OrderVoucher, Voucher, OrderStatusHistory, Payment, Product, ProductVariantImage, AttributeValue, Attribute, UserVoucher, Inventory, sequelize } = require("../models");

const orderIncludes = [
  {
    model: OrderItem,
    required: false,
    include: [
      {
        model: OrderItemSerial,
        required: false,
        include: [{ model: SerialNumber, required: false }]
      },
      {
        model: ProductVariant,
        required: false,
        include: [
          { model: Product },
          { model: ProductVariantImage, attributes: ['id', 'image_url'] },
          {
            model: AttributeValue,
            include: [{ model: Attribute, attributes: ['id', 'name'] }]
          }
        ]
      }
    ]
  },
  {
    model: Warehouse,
    required: false
  },
  {
    model: Warranty,
    required: false
  },
  {
    model: Voucher,
    required: false
  },
  {
    model: OrderStatusHistory,
    required: false
  },
  {
    model: Payment,
    required: false
  }
];

const getAllOrdersService = async () => {
  try {
    const orders = await Order.findAll({
      include: orderIncludes,
      order: [["id", "ASC"]],
    });

    return {
      message: "Orders retrieved successfully",
      data: orders,
    };
  } catch (error) {
    throw error;
  }
};

const getMyOrdersService = async (userId) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: userId },
      include: orderIncludes,
      order: [["created_at", "DESC"]],
    });

    return {
      message: "My orders retrieved successfully",
      data: orders,
    };
  } catch (error) {
    throw error;
  }
};
const getOrderByCodeService = async (code) => {
  try {
    const order = await Order.findOne({
      where: { order_code: code },
      include: orderIncludes
    });
    if (!order) {
      throw new Error("Order not found");
    }
    return {
      message: "Order retrieved successfully",
      data: order,
    };
  } catch (error) {
    throw error;
  }
};
const getOrderByIdService = async (id) => {
  try {
    const order = await Order.findByPk(id, {
      include: orderIncludes
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return {
      message: "Order retrieved successfully",
      data: order,
    };
  } catch (error) {
    throw error;
  }
};

const createOrderService = async (userId, data, req) => {
  // BẮT BUỘC SỬ DỤNG TRANSACTION CHO LUỒNG CHECKOUT
  const t = await sequelize.transaction();

  try {
    const {
      total_base_price, total_discount, shipping_fee, final_amount,
      shipping_address_json, payment_method, delivery_method,
      note, warehouse_id, created_by, items, voucher_code
    } = data;

    let selectedWarehouseId = warehouse_id;
    let isFulfillable = false; // Biến cờ kiểm tra xem có kho nào đáp ứng được không

    if (items && items.length > 0) {
      const warehouses = await Warehouse.findAll({ order: [['id', 'ASC']], transaction: t });

      for (const warehouse of warehouses) {
        let canFulfill = true;
        for (const item of items) {
          const stock = await Inventory.findOne({
            where: {
              warehouse_id: warehouse.id,
              variant_id: item.variant_id
            },
            lock: t.LOCK.UPDATE, // Khóa dòng này lại để chống Race Condition
            transaction: t
          });

          const availableQuantity = stock ? (Number(stock.quantity) - Number(stock.reserved_quantity || 0)) : 0;
          if (availableQuantity < Number(item.quantity)) {
            canFulfill = false;
            break;
          }
        }

        if (canFulfill) {
          selectedWarehouseId = warehouse.id;
          isFulfillable = true;
          break; // Tìm thấy kho đầu tiên đủ hàng thì dừng lại
        }
      }
    }

    // NẾU KHÔNG KHO NÀO ĐỦ HÀNG -> CHẶN NGAY LẬP TỨC
    if (!isFulfillable) {
      throw new Error("Sản phẩm đã hết hàng hoặc không đủ số lượng trong kho để đáp ứng.");
    }

    const order_code = "ORD" + Date.now();

    // NHỚ TRUYỀN { transaction: t } VÀO TẤT CẢ CÁC QUERY
    const newOrder = await Order.create({
      user_id: userId,
      warehouse_id: selectedWarehouseId,
      created_by,
      order_code,
      total_base_price, total_discount, shipping_fee, final_amount,
      shipping_address_json, payment_method, delivery_method, note,
      order_status: "pending",
      payment_status: "unpaid",
      created_at: new Date(),
    }, { transaction: t });

    let createdItems = [];
    if (items && items.length > 0) {
      const orderItemsData = items.map(item => ({
        order_id: newOrder.id,
        variant_id: item.variant_id,
        product_name_snapshot: item.product_name_snapshot,
        variant_name_snapshot: item.variant_name_snapshot,
        price_at_purchase: item.price_at_purchase,
        quantity: Number(item.quantity),
        total_price: item.total_price
      }));
      createdItems = await OrderItem.bulkCreate(orderItemsData, { transaction: t });

      // TĂNG RESERVED_QUANTITY CHO TỪNG ITEM
      for (const item of items) {
        const stock = await Inventory.findOne({
          where: {
            warehouse_id: selectedWarehouseId,
            variant_id: item.variant_id
          },
          transaction: t
        });

        if (stock) {
          // SỬ DỤNG .increment() SẼ AN TOÀN VÀ CHUẨN XÁC HƠN CỘNG THỦ CÔNG
          await stock.increment('reserved_quantity', {
            by: Number(item.quantity),
            transaction: t
          });
        }
      }
    }

    // XỬ LÝ VOUCHER
    if (voucher_code) {
      const voucher = await Voucher.findOne({ where: { code: voucher_code }, transaction: t });
      if (voucher) {
        await OrderVoucher.create({
          order_id: newOrder.id,
          voucher_id: voucher.id,
          discount_amount: total_discount || 0
        }, { transaction: t });

        if (voucher.usage_limit !== null && voucher.usage_limit > 0) {
          await voucher.decrement('usage_limit', { by: 1, transaction: t });
        }

        const userVoucher = await UserVoucher.findOne({
          where: { user_id: userId, voucher_id: voucher.id },
          transaction: t
        });

        if (userVoucher) {
          await userVoucher.update({ is_used: true }, { transaction: t });
        } else {
          await UserVoucher.create({
            user_id: userId,
            voucher_id: voucher.id,
            is_used: true,
            saved_at: new Date()
          }, { transaction: t });
        }
      }
    }

    await t.commit(); // Thành công hết thì Lưu thay đổi vào DB

    let paymentUrl = null;
    try {
      const { createVNPayPaymentUrl, createMoMoPaymentUrl, createZaloPayPaymentUrl } = require('./paymentGatewayService');
      if (payment_method === 'vnpay') {
        paymentUrl = createVNPayPaymentUrl(req || { headers: {}, connection: {} }, newOrder);
      } else if (payment_method === 'momo') {
        paymentUrl = await createMoMoPaymentUrl(newOrder);
      } else if (payment_method === 'zalo') {
        paymentUrl = await createZaloPayPaymentUrl(newOrder);
      }
    } catch(e) {
      console.error("Error creating payment URL:", e);
    }

    return {
      message: "Order created successfully",
      data: {
        ...newOrder.toJSON(),
        items: createdItems
      },
      paymentUrl
    };
  } catch (error) {
    await t.rollback(); // Có lỗi ở bất kỳ dòng nào thì Rollback hoàn tác lại kho
    console.error("createOrderService Error:", error);
    throw error;
  }
};

const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancel'],
  confirmed: ['shipping', 'cancel'],
  shipping: ['delivered', 'returned', 'cancel'],
  delivered: ['completed', 'returned'],
  completed: [],
  cancel: [],
  returned: []
};

const updateOrderStatusService = async (id, data, adminId) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem }],
      transaction: t
    });
    if (!order) {
      throw new Error("Order not found");
    }

    const { payment_status, order_status, note, serial_numbers } = data;
    let isChanged = false;

    if (payment_status && order.payment_status !== payment_status) {
      order.payment_status = payment_status;
      isChanged = true;
    }

    if (order_status && order.order_status !== order_status) {
      const currentStatus = order.order_status?.toLowerCase() || 'pending';
      const nextStatus = order_status.toLowerCase();

      const allowedTransitions = VALID_TRANSITIONS[currentStatus];
      if (!allowedTransitions || !allowedTransitions.includes(nextStatus)) {
        throw new Error(`Invalid status transition from ${currentStatus} to ${nextStatus}`);
      }

      if (nextStatus === 'completed' && order.payment_status !== 'paid') {
        throw new Error("Order must be Paid before it can be marked as Delivered. Otherwise, it can only be Returned.");
      }

      // Handle Cancel (release reserved inventory)
      if (nextStatus === 'cancel' && (currentStatus === 'pending' || currentStatus === 'confirmed')) {
        for (const item of order.OrderItems) {
          const stock = await Inventory.findOne({
            where: { warehouse_id: order.warehouse_id, variant_id: item.variant_id },
            transaction: t
          });
          if (stock) {
            await stock.update({
              reserved_quantity: Math.max(0, (stock.reserved_quantity || 0) - item.quantity)
            }, { transaction: t });
          }
        }
      }

      // Handle Shipping (process serial numbers and deduct inventory)
      if (nextStatus === 'shipping') {
        if (!serial_numbers || !Array.isArray(serial_numbers)) {
          throw new Error("Phải cung cấp số Serial/IMEI để xuất hàng (shipping).");
        }

        for (const item of order.OrderItems) {
          const itemSerials = serial_numbers.find(sn => sn.order_item_id === item.id);
          if (!itemSerials || !itemSerials.serial_ids || itemSerials.serial_ids.length !== item.quantity) {
            throw new Error(`Số lượng Serial/IMEI không khớp với số lượng mua cho sản phẩm ${item.product_name_snapshot}. Yêu cầu: ${item.quantity}.`);
          }

          // Validate and link serial numbers
          for (const serialId of itemSerials.serial_ids) {
            const serialRecord = await SerialNumber.findOne({
              where: { id: serialId, variant_id: item.variant_id, warehouse_id: order.warehouse_id },
              transaction: t
            });
            if (!serialRecord || serialRecord.status !== 'available') {
              throw new Error(`Serial/IMEI (ID: ${serialId}) không tồn tại, không khả dụng hoặc không nằm trong kho hiện tại.`);
            }

            await serialRecord.update({ status: 'sold' }, { transaction: t });

            await OrderItemSerial.create({
              order_item_id: item.id,
              serial_number_id: serialId
            }, { transaction: t });
          }

          // Deduct inventory
          const stock = await Inventory.findOne({
            where: { warehouse_id: order.warehouse_id, variant_id: item.variant_id },
            transaction: t
          });
          if (stock) {
            await stock.update({
              quantity: Math.max(0, stock.quantity - item.quantity),
              reserved_quantity: Math.max(0, (stock.reserved_quantity || 0) - item.quantity)
            }, { transaction: t });
          }
        }
      }

      order.order_status = order_status;
      isChanged = true;

      // Record history
      await OrderStatusHistory.create({
        order_id: id,
        status: order_status,
        note: note || `Status updated to ${order_status}`,
        changed_by: adminId || null,
        created_at: new Date()
      }, { transaction: t });
    }

    if (isChanged) {
      order.updated_at = new Date();
      await order.save({ transaction: t });
    }

    await t.commit();
    return {
      message: "Order updated successfully",
      data: order,
    };
  } catch (error) {
    await t.rollback();
    console.error("updateOrderStatusService Error:", error);
    throw error;
  }
};

module.exports = {
  getAllOrdersService,
  getOrderByIdService,
  getMyOrdersService,
  createOrderService,
  getOrderByCodeService,
  updateOrderStatusService
};

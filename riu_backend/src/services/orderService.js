const { Order, OrderItem, Warehouse, Warranty, OrderItemSerial, SerialNumber, ProductVariant, OrderVoucher, Voucher, OrderStatusHistory, Payment, Product, ProductVariantImage, AttributeValue, Attribute, UserVoucher, Inventory } = require("../models");

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

const createOrderService = async (userId, data) => {
  try {
    const {
      total_base_price,
      total_discount,
      shipping_fee,
      final_amount,
      shipping_address_json,
      payment_method,
      delivery_method,
      note,
      warehouse_id,
      created_by,
      items, // Array of items: { variant_id, product_name_snapshot, variant_name_snapshot, price_at_purchase, quantity, total_price }
      voucher_code
    } = data;

    let selectedWarehouseId = warehouse_id || 1; // Default fallback

    if (items && items.length > 0) {
      const warehouses = await Warehouse.findAll({ order: [['id', 'ASC']] });
      for (const warehouse of warehouses) {
        let canFulfill = true;
        for (const item of items) {
          const stock = await Inventory.findOne({
            where: {
              warehouse_id: warehouse.id,
              variant_id: item.variant_id
            }
          });
          
          const availableQuantity = stock ? (stock.quantity - (stock.reserved_quantity || 0)) : 0;
          if (availableQuantity < item.quantity) {
            canFulfill = false;
            break;
          }
        }
        
        if (canFulfill) {
          selectedWarehouseId = warehouse.id;
          break; // Found the first warehouse that can fulfill the order
        }
      }
    }

    const order_code = "ORD" + Date.now();

    const newOrder = await Order.create({
      user_id: userId,
      warehouse_id: selectedWarehouseId,
      created_by,
      order_code,
      total_base_price,
      total_discount,
      shipping_fee,
      final_amount,
      shipping_address_json,
      payment_method,
      delivery_method,
      note,
      order_status: "pending",
      payment_status: "unpaid",
      created_at: new Date(),
    });

    let createdItems = [];
    if (items && items.length > 0) {
      const orderItemsData = items.map(item => ({
        order_id: newOrder.id,
        variant_id: item.variant_id,
        product_name_snapshot: item.product_name_snapshot,
        variant_name_snapshot: item.variant_name_snapshot,
        price_at_purchase: item.price_at_purchase,
        quantity: item.quantity,
        total_price: item.total_price
      }));
      createdItems = await OrderItem.bulkCreate(orderItemsData);
    }

    if (voucher_code) {
      const voucher = await Voucher.findOne({ where: { code: voucher_code } });
      if (voucher) {
        await OrderVoucher.create({
          order_id: newOrder.id,
          voucher_id: voucher.id,
          discount_amount: total_discount || 0
        });

        if (voucher.usage_limit !== null && voucher.usage_limit > 0) {
          await voucher.update({ usage_limit: voucher.usage_limit - 1 });
        }

        const userVoucher = await UserVoucher.findOne({
          where: { user_id: userId, voucher_id: voucher.id }
        });
        if (userVoucher) {
          await userVoucher.update({ is_used: true });
        } else {
          await UserVoucher.create({
            user_id: userId,
            voucher_id: voucher.id,
            is_used: true,
            saved_at: new Date()
          });
        }
      }
    }

    return {
      message: "Order created successfully",
      data: {
        ...newOrder.toJSON(),
        items: createdItems
      },
    };
  } catch (error) {
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
  try {
    const order = await Order.findByPk(id);
    if (!order) {
      throw new Error("Order not found");
    }

    const { payment_status, order_status, note } = data;
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

      order.order_status = order_status;
      isChanged = true;

      // Record history
      await OrderStatusHistory.create({
        order_id: id,
        status: order_status,
        note: note || `Status updated to ${order_status}`,
        changed_by: adminId || null,
        created_at: new Date()
      });
    }

    if (isChanged) {
      order.updated_at = new Date();
      await order.save();
    }

    return {
      message: "Order updated successfully",
      data: order,
    };
  } catch (error) {
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

const { Order, OrderItem, Warehouse, Warranty, OrderItemSerial, SerialNumber, ProductVariant, OrderVoucher, Voucher, OrderStatusHistory, Payment, Product, ProductVariantImage, AttributeValue, Attribute, UserVoucher, Inventory, Review, StaffTask, User, sequelize } = require("../models");
const users = require("../models/users");

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
  },
  {
    model: Review,
    required: false
  },
  {
    model: User,
    required: false
  }
];

const validateVoucher = async (voucher_code, userId, orderTotal, t) => {
  const voucher = await Voucher.findOne({ where: { code: voucher_code }, transaction: t });
  if (!voucher) throw new Error("Mã giảm giá không hợp lệ");

  let userPoints = 0;
  if (userId) {
    const user = await User.findByPk(userId, { transaction: t });
    if (user) userPoints = user.level_points || 0;
  }

  if (voucher.min_level_points !== null && userPoints < voucher.min_level_points) {
    throw new Error("Khách hàng không đủ điểm để sử dụng voucher này");
  }

  if (userId) {
    const usedVoucher = await UserVoucher.findOne({
      where: { user_id: userId, voucher_id: voucher.id, is_used: true },
      transaction: t
    });
    if (usedVoucher) {
      throw new Error("Khách hàng đã sử dụng voucher này rồi");
    }
  }

  const now = new Date();
  if (voucher.start_date && new Date(voucher.start_date) > now) {
    throw new Error("Mã giảm giá chưa đến thời gian áp dụng");
  }
  if (voucher.end_date && new Date(voucher.end_date) < now) {
    throw new Error("Mã giảm giá đã hết hạn");
  }
  if (voucher.usage_limit !== null && voucher.usage_limit <= 0) {
    throw new Error("Mã giảm giá đã hết lượt sử dụng");
  }
  if (orderTotal < Number(voucher.min_order_value)) {
    throw new Error(`Đơn hàng phải có giá trị tối thiểu ${voucher.min_order_value} để áp dụng`);
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

  return { voucher, discountValue };
};

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

    let validDiscountAmount = total_discount || 0;
    let actualVoucher = null;

    if (voucher_code) {
      const { voucher, discountValue } = await validateVoucher(voucher_code, userId, Number(total_base_price), t);
      validDiscountAmount = discountValue;
      actualVoucher = voucher;
    }

    const calculatedFinalAmount = Number(total_base_price) + Number(shipping_fee || 0) - Number(validDiscountAmount);

    // NHỚ TRUYỀN { transaction: t } VÀO TẤT CẢ CÁC QUERY
    const newOrder = await Order.create({
      user_id: userId,
      warehouse_id: selectedWarehouseId,
      created_by,
      order_code,
      total_base_price,
      total_discount: validDiscountAmount,
      shipping_fee: shipping_fee || 0,
      final_amount: calculatedFinalAmount,
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
    if (actualVoucher) {
      await OrderVoucher.create({
        order_id: newOrder.id,
        voucher_id: actualVoucher.id,
        discount_amount: validDiscountAmount
      }, { transaction: t });

      if (actualVoucher.usage_limit !== null && actualVoucher.usage_limit > 0) {
        await actualVoucher.decrement('usage_limit', { by: 1, transaction: t });
      }

      const userVoucher = await UserVoucher.findOne({
        where: { user_id: userId, voucher_id: actualVoucher.id },
        transaction: t
      });

      if (userVoucher) {
        await userVoucher.update({ is_used: true }, { transaction: t });
      } else {
        await UserVoucher.create({
          user_id: userId,
          voucher_id: actualVoucher.id,
          is_used: true,
          saved_at: new Date()
        }, { transaction: t });
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
    } catch (e) {
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

    const { payment_status, order_status, note, serial_numbers, shipper_id } = data;
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

      if (nextStatus === 'completed' && order.payment_status?.toLowerCase() !== 'paid') {
        throw new Error("Order must be Paid before it can be marked as Completed. Otherwise, it can only be Returned.");
      }

      // Handle Cancel from Pending/Confirmed (release reserved inventory)
      if (nextStatus === 'cancel' && (currentStatus === 'pending' || currentStatus === 'confirmed')) {
        for (const item of order.OrderItems) {
          const stock = await Inventory.findOne({
            where: { warehouse_id: order.warehouse_id, variant_id: item.variant_id },
            transaction: t
          });
          if (stock) {
            await stock.decrement('reserved_quantity', {
              by: Number(item.quantity),
              transaction: t
            });
          }
        }
      }

      // Handle Returned or Cancel from Shipping/Delivered (restore inventory and serials)
      if (
        nextStatus === 'returned' || 
        (nextStatus === 'cancel' && (currentStatus === 'shipping' || currentStatus === 'delivered'))
      ) {
        for (const item of order.OrderItems) {
          // Restore quantity
          const stock = await Inventory.findOne({
            where: { warehouse_id: order.warehouse_id, variant_id: item.variant_id },
            transaction: t
          });
          if (stock) {
            await stock.increment('quantity', {
              by: Number(item.quantity),
              transaction: t
            });
          }

          // Restore serial numbers and cancel warranties
          const itemSerials = await OrderItemSerial.findAll({
             where: { order_item_id: item.id },
             transaction: t
          });

          for (const itemSerial of itemSerials) {
             await SerialNumber.update({ status: 'available' }, { 
                where: { id: itemSerial.serial_number_id },
                transaction: t 
             });

             await Warranty.update({ status: 'cancelled' }, {
                where: { serial_number_id: itemSerial.serial_number_id, order_id: order.id },
                transaction: t
             });
          }
        }
      }

      // Handle Shipping (process serial numbers and deduct inventory)
      if (nextStatus === 'shipping') {
        if (!shipper_id) {
          throw new Error("Phải bắt buộc chọn nhân viên giao hàng (shipping).");
        }
        
        // Tạo StaffTask cho nhân viên giao hàng
        await StaffTask.create({
          order_id: id,
          staff_id: shipper_id,
          task_type: "shipping",
          note: "Giao hàng cho đơn hàng",
          started_at: new Date(),
          status: "pending",
          created_at: new Date()
        }, { transaction: t });

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

            // Tạo thông tin bảo hành
            const variant = await ProductVariant.findByPk(item.variant_id, { include: [{ model: Product }], transaction: t });
            const warrantyMonths = variant?.Product?.warranty_months || 0;
            
            if (warrantyMonths > 0) {
              const purchaseDate = new Date();
              const expiryDate = new Date(purchaseDate);
              expiryDate.setMonth(expiryDate.getMonth() + warrantyMonths);
              
              await Warranty.create({
                serial_number_id: serialId,
                user_id: order.user_id,
                order_id: order.id,
                purchase_date: purchaseDate,
                expiry_date: expiryDate,
                status: 'active'
              }, { transaction: t });
            }
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

      // Handle Completed (add membership points)
      if (nextStatus === 'completed' && currentStatus !== 'completed') {
        if (order.user_id) {
          let totalItemsQuantity = 0;
          for (const item of order.OrderItems) {
            totalItemsQuantity += Number(item.quantity);
          }
          if (totalItemsQuantity > 0) {
            const pointsToAdd = totalItemsQuantity * 10;
            const user = await User.findByPk(order.user_id, { transaction: t });
            if (user) {
              await user.increment('level_points', {
                by: pointsToAdd,
                transaction: t
              });
            }
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

const createDirectOrderService = async (adminId, data, req) => {
  const t = await sequelize.transaction();

  try {
    const {
      user_id, // customer id, nullable
      total_base_price, total_discount, shipping_fee, final_amount,
      payment_method, note, warehouse_id, items, voucher_code,
      staff_id, // The staff who consulted
      customer_name, customer_phone, serial_numbers
    } = data;

    if (!staff_id) {
      throw new Error("Bắt buộc phải chọn nhân viên tư vấn.");
    }
    const actualStaffId = staff_id;

    let selectedWarehouseId = warehouse_id;

    if (!selectedWarehouseId) {
      throw new Error("Phải chọn kho xuất hàng.");
    }

    if (items && items.length > 0) {
      for (const item of items) {
        const stock = await Inventory.findOne({
          where: {
            warehouse_id: selectedWarehouseId,
            variant_id: item.variant_id
          },
          lock: t.LOCK.UPDATE,
          transaction: t
        });

        const availableQuantity = stock ? (Number(stock.quantity) - Number(stock.reserved_quantity || 0)) : 0;
        if (availableQuantity < Number(item.quantity)) {
          throw new Error(`Sản phẩm ${item.product_name_snapshot} đã hết hàng hoặc không đủ số lượng trong kho.`);
        }
      }
    } else {
      throw new Error("Đơn hàng phải có ít nhất 1 sản phẩm.");
    }

    const order_code = "DIR" + Date.now();
    let shippingAddressJSON = null;
    if (customer_name || customer_phone) {
      shippingAddressJSON = { name: customer_name, phone: customer_phone };
    }

    let validDiscountAmount = total_discount || 0;
    let actualVoucher = null;

    if (voucher_code) {
      if (!user_id) {
        throw new Error("Voucher chỉ dành cho khách hàng đã đăng ký tài khoản. Vui lòng hướng dẫn khách hàng đăng ký.");
      }
      const { voucher, discountValue } = await validateVoucher(voucher_code, user_id, Number(total_base_price), t);
      validDiscountAmount = discountValue;
      actualVoucher = voucher;
    }

    // Đảm bảo số liệu chính xác
    const calculatedFinalAmount = Number(total_base_price) + Number(shipping_fee || 0) - Number(validDiscountAmount);

    // Payment status check
    let paymentStatus = payment_method === 'cash' ? 'paid' : 'unpaid';

    const newOrder = await Order.create({
      user_id: user_id || null,
      warehouse_id: selectedWarehouseId,
      created_by: actualStaffId,
      order_code,
      total_base_price,
      total_discount: validDiscountAmount,
      shipping_fee: shipping_fee || 0,
      final_amount: calculatedFinalAmount,
      shipping_address_json: shippingAddressJSON,
      payment_method: payment_method || 'cash',
      delivery_method: 'direct',
      order_status: "completed",
      payment_status: paymentStatus,
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

      // Fetch created items with their IDs for linking serials
      const savedItems = await OrderItem.findAll({
        where: { order_id: newOrder.id },
        transaction: t
      });

      for (const item of savedItems) {
        let itemQuantity = item.quantity;

        const stock = await Inventory.findOne({
          where: { warehouse_id: selectedWarehouseId, variant_id: item.variant_id },
          transaction: t
        });
        if (stock) {
          await stock.update({
            quantity: Math.max(0, stock.quantity - itemQuantity)
          }, { transaction: t });
        }

        if (serial_numbers && Array.isArray(serial_numbers)) {
          const matchedSerials = serial_numbers.find(sn => sn.variant_id === item.variant_id);

          if (matchedSerials && matchedSerials.serial_ids && matchedSerials.serial_ids.length === itemQuantity) {
            for (const serialId of matchedSerials.serial_ids) {
              const serialRecord = await SerialNumber.findOne({
                where: { id: serialId, variant_id: item.variant_id, warehouse_id: selectedWarehouseId },
                transaction: t
              });
              if (!serialRecord || serialRecord.status !== 'available') {
                throw new Error(`Serial/IMEI (ID: ${serialId}) không tồn tại hoặc không khả dụng trong kho.`);
              }

              await serialRecord.update({ status: 'sold' }, { transaction: t });

              await OrderItemSerial.create({
                order_item_id: item.id,
                serial_number_id: serialId
              }, { transaction: t });

              // Tạo thông tin bảo hành
              const variant = await ProductVariant.findByPk(item.variant_id, { include: [{ model: Product }], transaction: t });
              const warrantyMonths = variant?.Product?.warranty_months || 0;
              
              if (warrantyMonths > 0) {
                const purchaseDate = new Date();
                const expiryDate = new Date(purchaseDate);
                expiryDate.setMonth(expiryDate.getMonth() + warrantyMonths);
                
                await Warranty.create({
                  serial_number_id: serialId,
                  user_id: newOrder.user_id,
                  order_id: newOrder.id,
                  purchase_date: purchaseDate,
                  expiry_date: expiryDate,
                  status: 'active'
                }, { transaction: t });
              }
            }
          } else if (matchedSerials && matchedSerials.serial_ids && matchedSerials.serial_ids.length > 0) {
            throw new Error(`Số lượng Serial/IMEI không khớp với số lượng mua cho sản phẩm ${item.product_name_snapshot}.`);
          }
        }
      }
    }

    if (actualVoucher) {
      await OrderVoucher.create({
        order_id: newOrder.id,
        voucher_id: actualVoucher.id,
        discount_amount: validDiscountAmount
      }, { transaction: t });

      if (actualVoucher.usage_limit !== null && actualVoucher.usage_limit > 0) {
        await actualVoucher.decrement('usage_limit', { by: 1, transaction: t });
      }

      if (user_id) {
        const userVoucher = await UserVoucher.findOne({
          where: { user_id: user_id, voucher_id: actualVoucher.id },
          transaction: t
        });

        if (userVoucher) {
          await userVoucher.update({ is_used: true }, { transaction: t });
        } else {
          await UserVoucher.create({
            user_id: user_id,
            voucher_id: actualVoucher.id,
            is_used: true,
            saved_at: new Date()
          }, { transaction: t });
        }
      }
    }

    // Add membership points for direct completed order
    if (user_id) {
      let totalItemsQuantity = 0;
      if (items && items.length > 0) {
        for (const item of items) {
          totalItemsQuantity += Number(item.quantity);
        }
      }
      if (totalItemsQuantity > 0) {
        const pointsToAdd = totalItemsQuantity * 10;
        const user = await User.findByPk(user_id, { transaction: t });
        if (user) {
          await user.increment('level_points', {
            by: pointsToAdd,
            transaction: t
          });
        }
      }
    }

    await OrderStatusHistory.create({
      order_id: newOrder.id,
      status: "completed",
      note: "Đơn hàng tạo và hoàn thành trực tiếp tại cửa hàng",
      changed_by: adminId,
      created_at: new Date()
    }, { transaction: t });

    await StaffTask.create({
      order_id: newOrder.id,
      staff_id: actualStaffId,
      task_type: "consultation",
      note: "Tư vấn và tạo đơn hàng trực tiếp tại cửa hàng",
      started_at: new Date(),
      completed_at: new Date(),
      status: "completed",
      created_at: new Date()
    }, { transaction: t });

    await t.commit();

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
    } catch (e) {
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
    await t.rollback();
    console.error("createDirectOrderService Error:", error);
    throw error;
  }
};

module.exports = {
  getAllOrdersService,
  getOrderByIdService,
  getMyOrdersService,
  createOrderService,
  getOrderByCodeService,
  updateOrderStatusService,
  createDirectOrderService
};

const { getAllOrdersService, getOrderByIdService, createOrderService, getMyOrdersService, getOrderByCodeService, updateOrderStatusService, createDirectOrderService } = require("../services/orderService");

const getAllOrders = async (req, res) => {
  try {
    const result = await getAllOrdersService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getOrderByIdService(id);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "Order not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({
      message: error.message,
    });
  }
};
const getOrderByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const result = await getOrderByCodeService(code);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "Order not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({
      message: error.message,
    });
  }
};
const createOrder = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const userId = req.user.id;
    const result = await createOrderService(userId, req.body, req);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getMyOrdersService(userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const result = await updateOrderStatusService(id, req.body, adminId);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "Order not found") {
      return res.status(404).json({ message: error.message });
    }
    if (
      error.message && 
      (error.message.includes("Invalid status transition") || error.message.includes("Order must be Paid"))
    ) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({
      message: error.message,
    });
  }
};

const createDirectOrder = async (req, res) => {
  try {
    const adminId = req.user.id;
    const result = await createDirectOrderService(adminId, req.body, req);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  getMyOrders,
  createOrder,
  getOrderByCode,
  updateOrderStatus,
  createDirectOrder
};

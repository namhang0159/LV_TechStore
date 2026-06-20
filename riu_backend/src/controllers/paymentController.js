const paymentService = require("../services/paymentService");

const createPayment = async (req, res) => {
  try {
    const result = await paymentService.createPaymentService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getPaymentByOrderId = async (req, res) => {
  try {
    const result = await paymentService.getPaymentByOrderIdService(req.params.orderId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const result = await paymentService.updatePaymentStatusService(req.params.id, status);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPayment,
  getPaymentByOrderId,
  updatePaymentStatus,
};

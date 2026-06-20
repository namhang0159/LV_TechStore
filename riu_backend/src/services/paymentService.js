const db = require("../models");

const createPaymentService = async (data) => {
  try {
    const order = await db.Order.findByPk(data.order_id);
    if (!order) throw new Error("Order not found");

    const payment = await db.Payment.create({
      order_id: data.order_id,
      payment_gateway: data.payment_gateway,
      transaction_id: data.transaction_id,
      amount: data.amount,
      status: data.status || "pending",
      paid_at: data.status === "completed" ? new Date() : null,
    });

    return { success: true, message: "Payment recorded", data: payment };
  } catch (error) {
    throw new Error("Error recording payment: " + error.message);
  }
};

const getPaymentByOrderIdService = async (orderId) => {
  try {
    const payments = await db.Payment.findAll({ where: { order_id: orderId } });
    return { success: true, data: payments };
  } catch (error) {
    throw new Error("Error fetching payments: " + error.message);
  }
};

const updatePaymentStatusService = async (id, status) => {
  try {
    const payment = await db.Payment.findByPk(id);
    if (!payment) throw new Error("Payment not found");

    await payment.update({
      status: status,
      paid_at: status === "completed" ? new Date() : payment.paid_at,
    });

    // Automatically update order status if payment is completed
    if (status === "completed") {
      const order = await db.Order.findByPk(payment.order_id);
      if (order && order.status === "pending") {
         await order.update({ status: "processing" });
      }
    }

    return { success: true, message: "Payment status updated", data: payment };
  } catch (error) {
    throw new Error("Error updating payment status: " + error.message);
  }
};

module.exports = {
  createPaymentService,
  getPaymentByOrderIdService,
  updatePaymentStatusService,
};

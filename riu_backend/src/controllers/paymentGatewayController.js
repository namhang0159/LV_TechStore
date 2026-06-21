const paymentGatewayService = require("../services/paymentGatewayService");
const { Order, OrderStatusHistory } = require("../models");

const vnpayReturn = async (req, res) => {
  let vnp_Params = req.query;
  const result = paymentGatewayService.verifyVNPayReturn(vnp_Params);
  
  if (result.success) {
    try {
      const order = await Order.findOne({ where: { order_code: result.orderId } });
      if (order && order.payment_status === "unpaid") {
        order.payment_status = "paid";
        order.order_status = "confirmed";
        await order.save();

        await OrderStatusHistory.create({
          order_id: order.id,
          status: "confirmed",
          note: "VNPay Payment Successful",
          created_at: new Date()
        });
      }
    } catch(e) {
      console.error(e);
    }
    
    // Redirect to frontend success page
    res.redirect(`${process.env.FRONTEND_URL}/checkout/payment-result?status=success&method=vnpay&orderId=${result.orderId}`);
  } else {
    res.redirect(`${process.env.FRONTEND_URL}/checkout/payment-result?status=failed&method=vnpay&orderId=${result.orderId}`);
  }
};

const vnpayIpn = async (req, res) => {
  let vnp_Params = req.query;
  const result = paymentGatewayService.verifyVNPayReturn(vnp_Params);

  if (result.success) {
    try {
      const order = await Order.findOne({ where: { order_code: result.orderId } });
      if (order) {
        if (order.final_amount == result.amount) {
          if (order.payment_status !== "paid") {
            order.payment_status = "paid";
            order.order_status = "confirmed";
            await order.save();
            
            await OrderStatusHistory.create({
              order_id: order.id,
              status: "confirmed",
              note: "VNPay IPN Payment Successful",
              created_at: new Date()
            });

            return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
          } else {
            return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
          }
        } else {
          return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
        }
      } else {
        return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
      }
    } catch (e) {
      return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
  } else {
    return res.status(200).json({ RspCode: '97', Message: 'Invalid Checksum' });
  }
};

const momoReturn = async (req, res) => {
  const { resultCode, orderId } = req.query;
  if (resultCode == 0) {
    try {
      const order = await Order.findOne({ where: { order_code: orderId } });
      if (order && order.payment_status === "unpaid") {
        order.payment_status = "paid";
        order.order_status = "confirmed";
        await order.save();
      }
    } catch(e) {}
    res.redirect(`${process.env.FRONTEND_URL}/checkout/payment-result?status=success&method=momo&orderId=${orderId}`);
  } else {
    res.redirect(`${process.env.FRONTEND_URL}/checkout/payment-result?status=failed&method=momo&orderId=${orderId}`);
  }
};

const momoIpn = async (req, res) => {
    // Basic IPN for Momo
    const { resultCode, orderId } = req.body;
    if (resultCode == 0) {
        try {
          const order = await Order.findOne({ where: { order_code: orderId } });
          if (order && order.payment_status === "unpaid") {
            order.payment_status = "paid";
            order.order_status = "confirmed";
            await order.save();
          }
        } catch(e) {}
    }
    return res.status(200).json({});
};

const zaloPayReturn = async (req, res) => {
  const { status, apptransid } = req.query;
  const orderId = apptransid ? apptransid.split('_').pop() : "";
  if (status == 1) {
    try {
      const order = await Order.findOne({ where: { order_code: orderId } });
      if (order && order.payment_status === "unpaid") {
        order.payment_status = "paid";
        order.order_status = "confirmed";
        await order.save();
      }
    } catch(e) {}
    res.redirect(`${process.env.FRONTEND_URL}/checkout/payment-result?status=success&method=zalo&orderId=${orderId}`);
  } else {
    res.redirect(`${process.env.FRONTEND_URL}/checkout/payment-result?status=failed&method=zalo&orderId=${orderId}`);
  }
};

const zaloPayIpn = async (req, res) => {
    // Basic IPN for Zalo
    return res.status(200).json({ return_code: 1, return_message: "success" });
};

module.exports = {
  vnpayReturn,
  vnpayIpn,
  momoReturn,
  momoIpn,
  zaloPayReturn,
  zaloPayIpn
};

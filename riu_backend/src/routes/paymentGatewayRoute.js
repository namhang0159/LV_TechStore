const express = require("express");
const router = express.Router();
const paymentGatewayController = require("../controllers/paymentGatewayController");

router.get("/vnpay_return", paymentGatewayController.vnpayReturn);
router.get("/vnpay_ipn", paymentGatewayController.vnpayIpn);

router.get("/momo_return", paymentGatewayController.momoReturn);
router.post("/momo_ipn", paymentGatewayController.momoIpn);

router.get("/zalopay_return", paymentGatewayController.zaloPayReturn);
router.post("/zalopay_ipn", paymentGatewayController.zaloPayIpn);

module.exports = router;

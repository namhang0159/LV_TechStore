const crypto = require("crypto");
const qs = require("qs");
const moment = require("moment");
const axios = require("axios");

const createVNPayPaymentUrl = (req, order) => {
  const tmnCode = process.env.vnp_TmnCode;
  const secretKey = process.env.vnp_HashSecret;
  let vnpUrl = process.env.vnp_Url;
  const returnUrl = process.env.vnp_ReturnUrl;

  const date = new Date();
  const createDate = moment(date).format("YYYYMMDDHHmmss");
  
  // order_code from DB
  const orderId = order.order_code || order.id;
  const amount = order.final_amount;
  const bankCode = ""; // Optional

  let ipAddr = req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  
  if (ipAddr === "::1") ipAddr = "127.0.0.1";

  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = "vn";
  vnp_Params["vnp_CurrCode"] = "VND";
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] = "Thanh toan don hang " + orderId;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;
  if (bankCode) {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(new Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + qs.stringify(vnp_Params, { encode: false });

  return vnpUrl;
};

const createMoMoPaymentUrl = async (order) => {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const momoUrl = process.env.MOMO_API_URL;
  const returnUrl = process.env.MOMO_RETURN_URL;

  // Momo requires unique request id
  const requestId = partnerCode + new Date().getTime();
  const orderId = order.order_code || order.id;
  const amount = order.final_amount;
  const orderInfo = "Thanh toan don hang " + orderId;
  const redirectUrl = returnUrl;
  const ipnUrl = process.env.BACKEND_URL + "/api/payments/momo_ipn";
  const requestType = "captureWallet";
  const extraData = ""; 

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

  const requestBody = {
    partnerCode,
    accessKey,
    requestId,
    amount,
    orderId: String(orderId),
    orderInfo,
    redirectUrl,
    ipnUrl,
    extraData,
    requestType,
    signature,
    lang: "vi"
  };

  try {
    const result = await axios.post(momoUrl, requestBody);
    if (result.data && result.data.payUrl) {
      return result.data.payUrl;
    } else {
      throw new Error(result.data.message || "Failed to create Momo URL");
    }
  } catch (error) {
    console.error("Momo API Error:", error.response?.data || error.message);
    throw new Error("Không thể tạo liên kết thanh toán MoMo");
  }
};

const createZaloPayPaymentUrl = async (order) => {
  const config = {
    app_id: process.env.ZALO_APP_ID,
    key1: process.env.ZALO_KEY1,
    key2: process.env.ZALO_KEY2,
    endpoint: process.env.ZALO_ENDPOINT
  };
  
  const embed_data = { redirecturl: process.env.ZALO_RETURN_URL };
  const items = [{}];
  const transID = Math.floor(Math.random() * 1000000);
  const orderId = order.order_code || order.id;

  const requestBody = {
    app_id: config.app_id,
    app_trans_id: `${moment().format('YYMMDD')}_${transID}_${orderId}`, // translation missing
    app_user: "user123",
    app_time: Date.now(), // miliseconds
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: order.final_amount,
    description: `Thanh toan cho don hang #${orderId}`,
    bank_code: "",
    callback_url: process.env.BACKEND_URL + "/api/payments/zalopay_ipn",
  };

  const data = config.app_id + "|" + requestBody.app_trans_id + "|" + requestBody.app_user + "|" + requestBody.amount + "|" + requestBody.app_time + "|" + requestBody.embed_data + "|" + requestBody.item;
  requestBody.mac = crypto.createHmac("sha256", config.key1).update(data).digest("hex");

  try {
    const result = await axios.post(config.endpoint, qs.stringify(requestBody));
    if (result.data && result.data.order_url) {
      return result.data.order_url;
    } else {
      throw new Error(result.data.return_message || "Failed to create ZaloPay URL");
    }
  } catch (error) {
    console.error("ZaloPay API Error:", error.response?.data || error.message);
    throw new Error("Không thể tạo liên kết thanh toán ZaloPay");
  }
};

const verifyVNPayReturn = (vnp_Params) => {
  let secureHash = vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);
  let secretKey = process.env.vnp_HashSecret;
  let signData = qs.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash === signed) {
    // Check if success
    if (vnp_Params["vnp_ResponseCode"] === "00") {
      return { success: true, orderId: vnp_Params["vnp_TxnRef"], amount: vnp_Params["vnp_Amount"] / 100 };
    }
    return { success: false, orderId: vnp_Params["vnp_TxnRef"], message: "Giao dịch không thành công" };
  } else {
    return { success: false, message: "Sai chữ ký bảo mật" };
  }
};

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

module.exports = {
  createVNPayPaymentUrl,
  createMoMoPaymentUrl,
  createZaloPayPaymentUrl,
  verifyVNPayReturn
};

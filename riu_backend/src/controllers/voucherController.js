const voucherService = require("../services/voucherService");

const createVoucher = async (req, res) => {
  try {
    const result = await voucherService.createVoucherService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const jwt = require("jsonwebtoken");

const getAllVouchers = async (req, res) => {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "admin_secret");
        userId = decoded.id;
      } catch (err) {
        // ignore invalid token for this optional check
      }
    }

    const result = await voucherService.getAllVouchersService(userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
const getAllVouchersByAdmin = async (req, res) => {
  try {
    const result = await voucherService.getAllVouchersByAdminService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
const saveUserVoucher = async (req, res) => {
  try {
    const userId = req.user.id;
    const { voucherId } = req.params;
    const result = await voucherService.saveUserVoucherService(userId, voucherId);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await voucherService.getVoucherByIdService(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getVoucherAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await voucherService.getVoucherAdminByIdService(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await voucherService.updateVoucherService(id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await voucherService.deleteVoucherService(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const applyVoucher = async (req, res) => {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, "SECRET_KEY");
        userId = decoded.id;
      } catch (err) {
        // ignore invalid token
      }
    }

    const { code, orderTotal } = req.body;
    const result = await voucherService.applyVoucherService(code, orderTotal, userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getMyVouchers = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await voucherService.getMyVouchersService(userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createVoucher,
  getAllVouchers,
  saveUserVoucher,
  getVoucherById,
  getVoucherAdminById,
  updateVoucher,
  deleteVoucher,
  applyVoucher,
  getMyVouchers,
  getAllVouchersByAdmin,
};

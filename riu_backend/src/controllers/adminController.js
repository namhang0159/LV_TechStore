const adminService = require("../services/adminService");

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await adminService.loginAdminService(email, password);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};
const fetchAdmin = async (req, res) => {
  try {
    const result = await adminService.fetchAdminService(req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
const createAdmin = async (req, res) => {
  try {
    const result = await adminService.createAdminService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const result = await adminService.getAllAdminsService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.updateAdminService(id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteAdminService(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const refreshTokenAdmin = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await adminService.refreshTokenAdminService(refreshToken);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

module.exports = {
  loginAdmin,
  createAdmin,
  getAllAdmins,
  fetchAdmin,
  updateAdmin,
  deleteAdmin,
  refreshTokenAdmin,
};

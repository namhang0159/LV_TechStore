const warrantyService = require("../services/warrantyService");

const activateWarranty = async (req, res) => {
  try {
    // Admins or internal order process usually triggers this, or user registers it
    const result = await warrantyService.activateWarrantyService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getUserWarranties = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await warrantyService.getUserWarrantiesService(userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllWarrantiesAdmin = async (req, res) => {
  try {
    const result = await warrantyService.getAllWarrantiesAdminService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const lookupWarrantyBySerialNumber = async (req, res) => {
  try {
    const { serial_number } = req.params;
    const result = await warrantyService.lookupWarrantyBySerialNumberService(serial_number);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  activateWarranty,
  getUserWarranties,
  getAllWarrantiesAdmin,
  lookupWarrantyBySerialNumber
};

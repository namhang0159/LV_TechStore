const supplierService = require("../services/supplierService");

const createSupplier = async (req, res) => {
  try {
    const result = await supplierService.createSupplierService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllSuppliers = async (req, res) => {
  try {
    const result = await supplierService.getAllSuppliersService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const result = await supplierService.updateSupplierService(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const result = await supplierService.deleteSupplierService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSupplier,
  getAllSuppliers,
  updateSupplier,
  deleteSupplier,
};

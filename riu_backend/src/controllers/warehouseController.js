const warehouseService = require("../services/warehouseService");

const createWarehouse = async (req, res) => {
  try {
    const result = await warehouseService.createWarehouseService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllWarehouses = async (req, res) => {
  try {
    const result = await warehouseService.getAllWarehousesService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getWarehouseById = async (req, res) => {
  try {
    const result = await warehouseService.getWarehouseByIdService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateWarehouse = async (req, res) => {
  try {
    const result = await warehouseService.updateWarehouseService(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteWarehouse = async (req, res) => {
  try {
    const result = await warehouseService.deleteWarehouseService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
};

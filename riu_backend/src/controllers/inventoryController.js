const inventoryService = require("../services/inventoryService");

const getInventory = async (req, res) => {
  try {
    const result = await inventoryService.getInventoryService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const createTransaction = async (req, res) => {
  try {
    // Assuming req.user exists from admin auth middleware
    const adminId = req.user ? req.user.id : null; 
    const result = await inventoryService.createTransactionService(adminId, req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const result = await inventoryService.getTransactionByIdService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInventory,
  createTransaction,
  getTransactionById
};

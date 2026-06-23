const customerService = require("../services/customerService");

const getAllCustomers = async (req, res) => {
  try {
    const result = await customerService.getAllCustomersService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const result = await customerService.getCustomerByIdService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateCustomerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const result = await customerService.updateCustomerStatusService(req.params.id, status);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getCustomerClustering = async (req, res) => {
  try {
    const result = await customerService.getCustomerClusteringService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  updateCustomerStatus,
  getCustomerClustering
};

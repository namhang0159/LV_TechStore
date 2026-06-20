const shippingService = require("../services/shippingService");

const createShippingPartner = async (req, res) => {
  try {
    const result = await shippingService.createShippingPartnerService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllShippingPartners = async (req, res) => {
  try {
    const result = await shippingService.getAllShippingPartnersService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateShippingPartner = async (req, res) => {
  try {
    const result = await shippingService.updateShippingPartnerService(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteShippingPartner = async (req, res) => {
  try {
    const result = await shippingService.deleteShippingPartnerService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const createShipment = async (req, res) => {
  try {
    const result = await shippingService.createShipmentService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateShipmentStatus = async (req, res) => {
  try {
    const result = await shippingService.updateShipmentStatusService(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createShippingPartner,
  getAllShippingPartners,
  updateShippingPartner,
  deleteShippingPartner,
  createShipment,
  updateShipmentStatus
};

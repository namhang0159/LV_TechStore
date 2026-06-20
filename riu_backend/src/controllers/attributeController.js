const attributeService = require("../services/attributeService");

const createAttribute = async (req, res) => {
  try {
    const result = await attributeService.createAttributeService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllAttributes = async (req, res) => {
  try {
    const result = await attributeService.getAllAttributesService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAttributeById = async (req, res) => {
  try {
    const result = await attributeService.getAttributeByIdService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateAttribute = async (req, res) => {
  try {
    const result = await attributeService.updateAttributeService(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteAttribute = async (req, res) => {
  try {
    const result = await attributeService.deleteAttributeService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const createAttributeValue = async (req, res) => {
  try {
    const result = await attributeService.createAttributeValueService(req.params.attributeId, req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteAttributeValue = async (req, res) => {
  try {
    const result = await attributeService.deleteAttributeValueService(req.params.valueId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAttribute,
  getAllAttributes,
  getAttributeById,
  updateAttribute,
  deleteAttribute,
  createAttributeValue,
  deleteAttributeValue
};

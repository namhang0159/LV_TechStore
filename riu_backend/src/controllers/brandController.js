const {
  createBrandService,
  getAllBrandsService,
  getBrandByIdService,
  updateBrandService,
  deleteBrandService,
} = require("../services/brandService");

const createBrand = async (req, res) => {
  try {
    const result = await createBrandService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllBrands = async (req, res) => {
  try {
    const result = await getAllBrandsService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getBrandById = async (req, res) => {
  try {
    const result = await getBrandByIdService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateBrand = async (req, res) => {
  try {
    const result = await updateBrandService(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const result = await deleteBrandService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
};

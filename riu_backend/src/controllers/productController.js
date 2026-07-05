const { getAllProductsService, getProductByIdService, createProductService, updateProductService, deleteProductService, getProductBySlugService } = require("../services/productService");

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await getAllProductsService(page, limit);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getProductByIdService(id);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "Product not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({
      message: error.message,
    });
  }
};
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await getProductBySlugService(slug);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "Product not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({
      message: error.message,
    });
  }
};
const createProduct = async (req, res) => {
  try {
    const result = await createProductService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateProductService(id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteProductService(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct, getProductBySlug
};

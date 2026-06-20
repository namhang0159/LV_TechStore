const {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
  deleteCategoryService,
  getCategoryBySlugService,
} = require("../services/categoryService");

const createCategory = async (req, res) => {
  try {
    const result = await createCategoryService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const result = await getAllCategoriesService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const result = await getCategoryByIdService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
const getCategoryBySlug = async (req, res) => {
  try {
    const result = await getCategoryBySlugService(req.params.slug);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const result = await updateCategoryService(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const result = await deleteCategoryService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory, getCategoryBySlug
};

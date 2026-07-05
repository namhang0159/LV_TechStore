const db = require("../models");

const createCategoryService = async (data) => {
  try {
    const newCategory = await db.Category.create({
      name: data.name,
      slug: data.slug,
      icon: data.icon,
      parent_id: data.parent_id || null,
      created_at: new Date(),
    });
    return {
      success: true,
      message: "Category created successfully",
      data: newCategory,
    };
  } catch (error) {
    throw new Error("Error creating category: " + error.message);
  }
};

const getAllCategoriesService = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    const { count, rows: categories } = await db.Category.findAndCountAll({
      distinct: true,
      limit,
      offset,
      include: [
        {
          model: db.Product,
          required: false,
          include: [
            { model: db.Brand },
            { model: db.ProductDescription },
            { model: db.ProductSpec },
            { model: db.Tag, through: { attributes: [] }, required: false },
            {
              model: db.ProductVariant,
              required: false,
              include: [
                { model: db.ProductVariantImage, required: false },
                {
                  model: db.AttributeValue,
                  required: false,
                  include: [{ model: db.Attribute, required: false }],
                },
              ],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });
    return {
      success: true,
      data: categories,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit
      }
    };
  } catch (error) {
    throw new Error("Error fetching categories: " + error.message);
  }
};
const getCategoryBySlugService = async (slug) => {
  try {
    const category = await db.Category.findOne({
      where: { slug },
      include: [
        {
          model: db.Product,
          attributes: [
            "id", "name", "slug", "brand_id", "category_id", "base_price",
            "description_short", "is_featured", "is_best_seller", "warranty_months",
            "status", "created_at", "updated_at",
          ],
          required: false,
          include: [
            { model: db.Brand, attributes: ["id", "name", "slug"], required: false },
            { model: db.ProductDescription, attributes: ["id", "type", "data_json"], required: false },
            { model: db.ProductSpec, attributes: ["id", "product_id", "group_name", "label", "value", "sort_order"], required: false },
            { model: db.Tag, attributes: ["id", "name"], through: { attributes: [] }, required: false },
            {
              model: db.ProductVariant,
              attributes: ["id", "price", "sku", "status"],
              required: false,
              include: [
                { model: db.ProductVariantImage, attributes: ["id", "image_url", "variant_id"], required: false },
                {
                  model: db.AttributeValue,
                  attributes: ["id", "value"],
                  required: false,
                  include: [{ model: db.Attribute, attributes: ["id", "name"], required: false }],
                },
              ],
            },
          ],
        },
      ],
    });
    if (!category) {
      throw new Error("Category not found");
    }
    return {
      success: true,
      data: category,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
const getCategoryByIdService = async (id) => {
  try {
    const category = await db.Category.findByPk(id, {
      include: [
        {
          model: db.Product,
          attributes: [
            "id", "name", "slug", "brand_id", "category_id", "base_price",
            "description_short", "is_featured", "is_best_seller", "warranty_months",
            "status", "created_at", "updated_at",
          ],
          required: false,
          include: [
            { model: db.Brand, attributes: ["id", "name", "slug"], required: false },
            { model: db.ProductDescription, attributes: ["id", "type", "data_json"], required: false },
            { model: db.ProductSpec, attributes: ["id", "product_id", "group_name", "label", "value", "sort_order"], required: false },
            { model: db.Tag, attributes: ["id", "name"], through: { attributes: [] }, required: false },
            {
              model: db.ProductVariant,
              attributes: ["id", "price", "sku", "status"],
              required: false,
              include: [
                { model: db.ProductVariantImage, attributes: ["id", "image_url", "variant_id"], required: false },
                {
                  model: db.AttributeValue,
                  attributes: ["id", "value"],
                  required: false,
                  include: [{ model: db.Attribute, attributes: ["id", "name"], required: false }],
                },
              ],
            },
          ],
        },
      ],
    });
    if (!category) {
      throw new Error("Category not found");
    }
    return {
      success: true,
      data: category,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateCategoryService = async (id, data) => {
  try {
    const category = await db.Category.findByPk(id);
    if (!category) {
      throw new Error("Category not found");
    }
    await category.update({
      name: data.name || category.name,
      slug: data.slug || category.slug,
      icon: data.icon !== undefined ? data.icon : category.icon,
      parent_id: data.parent_id !== undefined ? data.parent_id : category.parent_id,
    });
    return {
      success: true,
      message: "Category updated successfully",
      data: category,
    };
  } catch (error) {
    throw new Error("Error updating category: " + error.message);
  }
};

const deleteCategoryService = async (id) => {
  try {
    const category = await db.Category.findByPk(id);
    if (!category) {
      throw new Error("Category not found");
    }
    await category.destroy();
    return {
      success: true,
      message: "Category deleted successfully",
    };
  } catch (error) {
    throw new Error("Error deleting category: " + error.message);
  }
};

module.exports = {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
  deleteCategoryService, getCategoryBySlugService
};

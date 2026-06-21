const {
  Product,
  Category,
  Brand,
  ProductVariant,
  ProductDescription,
  ProductSpec,
  ProductVariantImage,
  Attribute,
  AttributeValue,
  Tag,
  Warranty,
  Review,
  Wishlist,
  CartItem,
  Inventory,
  SerialNumber,
  OrderItem,
  InventoryTransactionItem,
  sequelize,
} = require("../models");

const getAllProductsService = async () => {
  try {
    const products = await Product.findAll({
      attributes: [
        "id",
        "name",
        "slug",
        "brand_id",
        "category_id",
        "base_price",
        "description_short",
        "is_featured",
        "is_best_seller",
        "warranty_months",
        "status",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: Category,
          attributes: ["id", "name", "slug"],
          required: false,
        },
        { model: Brand, attributes: ["id", "name", "slug"], required: false },
        {
          model: ProductDescription,
          attributes: ["id", "type", "data_json"],
          required: false,
        },
        {
          model: ProductSpec,
          attributes: [
            "id",
            "product_id",
            "group_name",
            "label",
            "value",
            "sort_order",
          ],
          required: false,
        },
        {
          model: Tag,
          attributes: ["id", "name"],
          through: { attributes: [] },
          required: false,
        },
        {
          model: ProductVariant,
          attributes: ["id", "price", "sku", "status"],
          required: false,
          include: [
            {
              model: ProductVariantImage,
              attributes: ["id", "image_url", "variant_id"],
              required: false,
            },
            {
              model: AttributeValue,
              attributes: ["id", "value"],
              required: false,
              include: [
                {
                  model: Attribute,
                  attributes: ["id", "name"],
                  required: false,
                },
              ],
            },
            {
              model: Inventory,
              attributes: ["warehouse_id", "quantity", "reserved_quantity"],
              required: false,
            },
          ],
        },
      ],
      order: [["id", "ASC"]],
    });

    return {
      message: "Products retrieved successfully",
      data: products,
    };
  } catch (error) {
    throw error;
  }
};

const getProductByIdService = async (id) => {
  try {
    const product = await Product.findByPk(id, {
      attributes: [
        "id",
        "name",
        "slug",
        "brand_id",
        "category_id",
        "base_price",
        "description_short",
        "is_featured",
        "is_best_seller",
        "warranty_months",
        "status",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: Category,
          attributes: ["id", "name", "slug"],
          required: false,
        },
        { model: Brand, attributes: ["id", "name", "slug"], required: false },
        {
          model: ProductDescription,
          attributes: ["id", "type", "data_json"],
          required: false,
        },
        {
          model: ProductSpec,
          attributes: [
            "id",
            "product_id",
            "group_name",
            "label",
            "value",
            "sort_order",
          ],
          required: false,
        },
        {
          model: Tag,
          attributes: ["id", "name"],
          through: { attributes: [] },
          required: false,
        },
        {
          model: ProductVariant,
          attributes: ["id", "price", "sku", "status"],
          required: false,
          include: [
            {
              model: ProductVariantImage,
              attributes: ["id", "image_url", "variant_id"],
              required: false,
            },
            {
              model: AttributeValue,
              attributes: ["id", "value"],
              required: false,
              include: [
                {
                  model: Attribute,
                  attributes: ["id", "name"],
                  required: false,
                },
              ],
            },
            {
              model: Inventory,
              attributes: ["warehouse_id", "quantity", "reserved_quantity"],
              required: false,
            },
          ],
        },
      ],
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return {
      message: "Product retrieved successfully",
      data: product,
    };
  } catch (error) {
    throw error;
  }
};
const getProductBySlugService = async (slug) => {
  try {
    const product = await Product.findOne({
      where: { slug },
      include: [
        {
          model: Category,
          attributes: ["id", "name", "slug"],
          required: false,
        },
        { model: Brand, attributes: ["id", "name", "slug"], required: false },
        {
          model: ProductDescription,
          attributes: ["id", "type", "data_json"],
          required: false,
        },
        {
          model: ProductSpec,
          attributes: [
            "id",
            "product_id",
            "group_name",
            "label",
            "value",
            "sort_order",
          ],
          required: false,
        },
        {
          model: Tag,
          attributes: ["id", "name"],
          through: { attributes: [] },
          required: false,
        },
        {
          model: ProductVariant,
          attributes: ["id", "price", "sku", "status"],
          required: false,
          include: [
            {
              model: ProductVariantImage,
              attributes: ["id", "image_url", "variant_id"],
              required: false,
            },
            {
              model: AttributeValue,
              attributes: ["id", "value"],
              required: false,
              include: [
                {
                  model: Attribute,
                  attributes: ["id", "name"],
                  required: false,
                },
              ],
            },
            {
              model: Inventory,
              attributes: ["warehouse_id", "quantity", "reserved_quantity"],
              required: false,
            },
          ],
        },
      ],
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return {
      message: "Product retrieved successfully",
      data: product,
    };
  } catch (error) {
    throw error;
  }
};
const createProductService = async (data) => {
  const t = await sequelize.transaction();
  try {
    const newProduct = await Product.create(
      {
        name: data.name,
        slug: data.slug,
        brand_id: data.brand_id,
        category_id: data.category_id,
        base_price: data.base_price,
        description_short: data.description_short,
        is_featured: data.is_featured || false,
        is_best_seller: data.is_best_seller || false,
        warranty_months: data.warranty_months || 0,
        status: data.status || "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction: t }
    );

    if (data.descriptions && data.descriptions.length > 0) {
      const descriptions = data.descriptions.map((desc) => ({
        product_id: newProduct.id,
        type: desc.type,
        data_json: desc.data_json,
      }));
      await ProductDescription.bulkCreate(descriptions, { transaction: t });
    }

    if (data.specs && data.specs.length > 0) {
      const specs = data.specs.map((spec) => ({
        product_id: newProduct.id,
        group_name: spec.group_name,
        label: spec.label,
        value: spec.value,
        sort_order: spec.sort_order || 0,
      }));
      await ProductSpec.bulkCreate(specs, { transaction: t });
    }

    if (data.tags && data.tags.length > 0) {
      await newProduct.setTags(data.tags, { transaction: t });
    }

    if (data.variants && data.variants.length > 0) {
      for (const variant of data.variants) {
        const newVariant = await ProductVariant.create(
          {
            product_id: newProduct.id,
            price: variant.price,
            sku: variant.sku,
            status: variant.status || "active",
          },
          { transaction: t }
        );

        if (variant.images && variant.images.length > 0) {
          const images = variant.images.map((imgUrl) => ({
            variant_id: newVariant.id,
            image_url: imgUrl,
          }));
          await ProductVariantImage.bulkCreate(images, { transaction: t });
        }

        if (variant.attributes && variant.attributes.length > 0) {
          await newVariant.setAttributeValues(variant.attributes, { transaction: t });
        }
      }
    }

    await t.commit();
    return {
      success: true,
      message: "Product created successfully",
      data: newProduct,
    };
  } catch (error) {
    await t.rollback();
    throw new Error("Error creating product: " + error.message);
  }
};

const updateProductService = async (id, data) => {
  const t = await sequelize.transaction();
  try {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error("Product not found");
    }

    await product.update(data, { transaction: t });

    // Note: To fully implement update with nested relations (variants, specs, etc.)
    // you would typically wipe existing ones and recreate them, or do precise differential updates.
    // Assuming partial update for now or recreate logic if data arrays are provided:

    if (data.tags) {
      await product.setTags(data.tags, { transaction: t });
    }

    await t.commit();
    return {
      success: true,
      message: "Product updated successfully",
      data: product,
    };
  } catch (error) {
    await t.rollback();
    throw new Error("Error updating product: " + error.message);
  }
};

const deleteProductService = async (id) => {
  const t = await sequelize.transaction();
  try {
    const product = await Product.findByPk(id, {
      include: [{ model: ProductVariant }]
    });
    if (!product) {
      throw new Error("Product not found");
    }

    // Unlink tags
    await product.setTags([], { transaction: t });

    // Delete direct related entities
    await ProductDescription.destroy({ where: { product_id: id }, transaction: t });
    await ProductSpec.destroy({ where: { product_id: id }, transaction: t });
    await Review.destroy({ where: { product_id: id }, transaction: t });
    await Wishlist.destroy({ where: { product_id: id }, transaction: t });

    // Handle variants
    if (product.ProductVariants && product.ProductVariants.length > 0) {
      for (const variant of product.ProductVariants) {
        // Unlink attributes
        await variant.setAttributeValues([], { transaction: t });

        // Delete variant related entities
        await ProductVariantImage.destroy({ where: { variant_id: variant.id }, transaction: t });
        await CartItem.destroy({ where: { variant_id: variant.id }, transaction: t });
        await Inventory.destroy({ where: { variant_id: variant.id }, transaction: t });

        // Unlink variant from historical/financial records
        await SerialNumber.update({ variant_id: null }, { where: { variant_id: variant.id }, transaction: t });
        await OrderItem.update({ variant_id: null }, { where: { variant_id: variant.id }, transaction: t });
        await InventoryTransactionItem.update({ variant_id: null }, { where: { variant_id: variant.id }, transaction: t });

        // Delete the variant
        await variant.destroy({ transaction: t });
      }
    }

    // Finally delete the product
    await product.destroy({ transaction: t });

    await t.commit();
    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    await t.rollback();
    throw new Error("Error deleting product: " + error.message);
  }
};

module.exports = {
  getAllProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService, getProductBySlugService
};

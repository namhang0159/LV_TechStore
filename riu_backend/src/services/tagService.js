const db = require("../models");

const createTagService = async (data) => {
  try {
    const newTag = await db.Tag.create({
      name: data.name,
    });
    return {
      success: true,
      message: "Tag created successfully",
      data: newTag,
    };
  } catch (error) {
    throw new Error("Error creating tag: " + error.message);
  }
};

const getAllTagsService = async () => {
  try {
    const tags = await db.Tag.findAll({
      include: [
        {
          model: db.Product,
          required: false,
          through: { attributes: [] },
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
    });
    return {
      success: true,
      data: tags,
    };
  } catch (error) {
    throw new Error("Error fetching tags: " + error.message);
  }
};

const getTagByIdService = async (id) => {
  try {
    const tag = await db.Tag.findByPk(id, {
      include: [
        {
          model: db.Product,
          required: false,
          through: { attributes: [] },
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
    });
    if (!tag) {
      throw new Error("Tag not found");
    }
    return {
      success: true,
      data: tag,
    };
  } catch (error) {
    throw new Error("Error fetching tag: " + error.message);
  }
};

const deleteTagService = async (id) => {
  try {
    const tag = await db.Tag.findByPk(id);
    if (!tag) {
      throw new Error("Tag not found");
    }
    await tag.destroy();
    return {
      success: true,
      message: "Tag deleted successfully",
    };
  } catch (error) {
    throw new Error("Error deleting tag: " + error.message);
  }
};

module.exports = {
  createTagService,
  getAllTagsService,
  getTagByIdService,
  deleteTagService,
};

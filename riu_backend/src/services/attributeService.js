const db = require("../models");

const createAttributeService = async (data) => {
  try {
    const newAttribute = await db.Attribute.create({
      name: data.name,
      slug: data.slug,
      filterable: data.filterable !== undefined ? data.filterable : true,
      category_id: data.category_id || null,
    });

    if (data.values && Array.isArray(data.values) && data.values.length > 0) {
      const values = data.values.map(v => ({
        attribute_id: newAttribute.id,
        value: v.value,
        slug: v.slug
      }));
      await db.AttributeValue.bulkCreate(values);
    }

    const createdAttr = await db.Attribute.findByPk(newAttribute.id, {
      include: [{ model: db.AttributeValue }]
    });

    return {
      success: true,
      message: "Attribute created successfully",
      data: createdAttr,
    };
  } catch (error) {
    throw new Error("Error creating attribute: " + error.message);
  }
};

const getAllAttributesService = async () => {
  try {
    const attributes = await db.Attribute.findAll({
      include: [{ model: db.AttributeValue }]
    });
    return {
      success: true,
      data: attributes,
    };
  } catch (error) {
    throw new Error("Error fetching attributes: " + error.message);
  }
};

const getAttributeByIdService = async (id) => {
  try {
    const attribute = await db.Attribute.findByPk(id, {
      include: [{ model: db.AttributeValue }]
    });
    if (!attribute) {
      throw new Error("Attribute not found");
    }
    return {
      success: true,
      data: attribute,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateAttributeService = async (id, data) => {
  try {
    const attribute = await db.Attribute.findByPk(id);
    if (!attribute) {
      throw new Error("Attribute not found");
    }
    await attribute.update({
      name: data.name || attribute.name,
      slug: data.slug || attribute.slug,
      filterable: data.filterable !== undefined ? data.filterable : attribute.filterable,
      category_id: data.category_id !== undefined ? data.category_id : attribute.category_id,
    });
    return {
      success: true,
      message: "Attribute updated successfully",
      data: attribute,
    };
  } catch (error) {
    throw new Error("Error updating attribute: " + error.message);
  }
};

const deleteAttributeService = async (id) => {
  try {
    const attribute = await db.Attribute.findByPk(id);
    if (!attribute) {
      throw new Error("Attribute not found");
    }
    // Delete associated values first
    await db.AttributeValue.destroy({ where: { attribute_id: id } });
    await attribute.destroy();
    return {
      success: true,
      message: "Attribute deleted successfully",
    };
  } catch (error) {
    throw new Error("Error deleting attribute: " + error.message);
  }
};

const createAttributeValueService = async (attribute_id, data) => {
  try {
    const attribute = await db.Attribute.findByPk(attribute_id);
    if (!attribute) throw new Error("Attribute not found");

    const newValue = await db.AttributeValue.create({
      attribute_id: attribute_id,
      value: data.value,
      slug: data.slug
    });
    return { success: true, message: "Attribute value created", data: newValue };
  } catch (error) {
    throw new Error("Error creating attribute value: " + error.message);
  }
}

const deleteAttributeValueService = async (id) => {
  try {
    const attrValue = await db.AttributeValue.findByPk(id);
    if (!attrValue) throw new Error("Attribute value not found");
    await attrValue.destroy();
    return { success: true, message: "Attribute value deleted" };
  } catch (error) {
    throw new Error("Error deleting attribute value: " + error.message);
  }
}

module.exports = {
  createAttributeService,
  getAllAttributesService,
  getAttributeByIdService,
  updateAttributeService,
  deleteAttributeService,
  createAttributeValueService,
  deleteAttributeValueService
};

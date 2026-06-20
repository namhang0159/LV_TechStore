const db = require("../models");

const createBrandService = async (data) => {
  try {
    const newBrand = await db.Brand.create({
      name: data.name,
      slug: data.slug,
      logo: data.logo || null,
    });
    return {
      success: true,
      message: "Brand created successfully",
      data: newBrand,
    };
  } catch (error) {
    throw new Error("Error creating brand: " + error.message);
  }
};

const getAllBrandsService = async () => {
  try {
    const brands = await db.Brand.findAll();
    return {
      success: true,
      data: brands,
    };
  } catch (error) {
    throw new Error("Error fetching brands: " + error.message);
  }
};

const getBrandByIdService = async (id) => {
  try {
    const brand = await db.Brand.findByPk(id);
    if (!brand) {
      throw new Error("Brand not found");
    }
    return {
      success: true,
      data: brand,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateBrandService = async (id, data) => {
  try {
    const brand = await db.Brand.findByPk(id);
    if (!brand) {
      throw new Error("Brand not found");
    }
    await brand.update({
      name: data.name || brand.name,
      slug: data.slug || brand.slug,
      logo: data.logo !== undefined ? data.logo : brand.logo,
    });
    return {
      success: true,
      message: "Brand updated successfully",
      data: brand,
    };
  } catch (error) {
    throw new Error("Error updating brand: " + error.message);
  }
};

const deleteBrandService = async (id) => {
  try {
    const brand = await db.Brand.findByPk(id);
    if (!brand) {
      throw new Error("Brand not found");
    }
    await brand.destroy();
    return {
      success: true,
      message: "Brand deleted successfully",
    };
  } catch (error) {
    throw new Error("Error deleting brand: " + error.message);
  }
};

module.exports = {
  createBrandService,
  getAllBrandsService,
  getBrandByIdService,
  updateBrandService,
  deleteBrandService,
};

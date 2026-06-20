const db = require("../models");

const createSupplierService = async (data) => {
  try {
    const newSupplier = await db.Supplier.create({
      name: data.name,
      contact: data.contact,
    });
    return { success: true, message: "Supplier created", data: newSupplier };
  } catch (error) {
    throw new Error("Error creating supplier: " + error.message);
  }
};

const getAllSuppliersService = async () => {
  try {
    const suppliers = await db.Supplier.findAll();
    return { success: true, data: suppliers };
  } catch (error) {
    throw new Error("Error fetching suppliers: " + error.message);
  }
};

const updateSupplierService = async (id, data) => {
  try {
    const supplier = await db.Supplier.findByPk(id);
    if (!supplier) throw new Error("Supplier not found");
    await supplier.update({
      name: data.name || supplier.name,
      contact: data.contact || supplier.contact,
    });
    return { success: true, message: "Supplier updated", data: supplier };
  } catch (error) {
    throw new Error("Error updating supplier: " + error.message);
  }
};

const deleteSupplierService = async (id) => {
  try {
    const supplier = await db.Supplier.findByPk(id);
    if (!supplier) throw new Error("Supplier not found");
    await supplier.destroy();
    return { success: true, message: "Supplier deleted" };
  } catch (error) {
    throw new Error("Error deleting supplier: " + error.message);
  }
};

module.exports = {
  createSupplierService,
  getAllSuppliersService,
  updateSupplierService,
  deleteSupplierService,
};

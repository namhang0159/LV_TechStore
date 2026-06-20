const db = require("../models");

const createWarehouseService = async (data) => {
  try {
    const newWarehouse = await db.Warehouse.create({
      name: data.name,
      location: data.location,
    });
    return { success: true, message: "Warehouse created", data: newWarehouse };
  } catch (error) {
    throw new Error("Error creating warehouse: " + error.message);
  }
};

const getAllWarehousesService = async () => {
  try {
    const warehouses = await db.Warehouse.findAll();
    return { success: true, data: warehouses };
  } catch (error) {
    throw new Error("Error fetching warehouses: " + error.message);
  }
};
const getWarehouseByIdService = async (id) => {
  try {
    const warehouse = await db.Warehouse.findByPk(id, {
      include: [
        {
          model: db.Inventory,
          include: [
            {
              model: db.ProductVariant,
              include: [{ model: db.Product }],
            },
          ],
        },
        {
          model: db.Order,
        },
        {
          model: db.InventoryTransaction,
        },
      ],
    });
    if (!warehouse) throw new Error("Warehouse not found");
    return { success: true, data: warehouse };
  } catch (error) {
    throw new Error("Error fetching warehouse: " + error.message);
  }
};

const updateWarehouseService = async (id, data) => {
  try {
    const warehouse = await db.Warehouse.findByPk(id);
    if (!warehouse) throw new Error("Warehouse not found");
    await warehouse.update({
      name: data.name || warehouse.name,
      location: data.location || warehouse.location,
    });
    return { success: true, message: "Warehouse updated", data: warehouse };
  } catch (error) {
    throw new Error("Error updating warehouse: " + error.message);
  }
};

const deleteWarehouseService = async (id) => {
  try {
    const warehouse = await db.Warehouse.findByPk(id);
    if (!warehouse) throw new Error("Warehouse not found");
    await warehouse.destroy();
    return { success: true, message: "Warehouse deleted" };
  } catch (error) {
    throw new Error("Error deleting warehouse: " + error.message);
  }
};

module.exports = {
  createWarehouseService,
  getAllWarehousesService,
  getWarehouseByIdService,
  updateWarehouseService,
  deleteWarehouseService,
};

const { sequelize, Inventory, InventoryTransaction, InventoryTransactionItem, ProductVariant, Warehouse, SerialNumber, InventoryTransactionSerial, Supplier, Admin, Product } = require("../models");

const getInventoryService = async () => {
  try {
    const inventory = await Inventory.findAll({
      include: [
        { model: ProductVariant, attributes: ['id', 'sku', 'price'] },
        { model: Warehouse, attributes: ['id', 'name', 'location'] }
      ],
      order: [['warehouse_id', 'ASC']]
    });
    return { success: true, data: inventory };
  } catch (error) {
    throw new Error("Error fetching inventory: " + error.message);
  }
};

const createTransactionService = async (adminId, data) => {
  const t = await sequelize.transaction();
  try {
    const { warehouse_id, transaction_type, reference_type, reference_id, note, items } = data;

    // Validate supplier for IN transactions
    if (transaction_type === "IN") {
      if (!reference_type || reference_type.toUpperCase() !== "SUPPLIER" || !reference_id) {
        throw new Error("Vui lòng chọn nhà cung cấp khi nhập kho.");
      }
      const supplier = await Supplier.findByPk(reference_id);
      if (!supplier) {
        throw new Error(`Không tìm thấy nhà cung cấp với ID ${reference_id}.`);
      }
    }

    // Create transaction
    const transaction = await InventoryTransaction.create({
      warehouse_id,
      transaction_type, // 'IN' or 'OUT'
      reference_type, // e.g. 'PO' (Purchase Order), 'ORDER', 'RETURN'
      reference_id,
      created_by: adminId || null,
      note,
      created_at: new Date()
    }, { transaction: t });

    // Process items
    if (items && items.length > 0) {
      for (const item of items) {
        // Create transaction item
        const txItem = await InventoryTransactionItem.create({
          transaction_id: transaction.id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost || 0,
          created_at: new Date()
        }, { transaction: t });

        if (!item.serials || !Array.isArray(item.serials) || item.serials.length !== item.quantity) {
          throw new Error(`Số lượng IMEI không khớp cho biến thể ${item.variant_id}. Cần nhập ${item.quantity} mã, nhưng nhận được ${item.serials ? item.serials.length : 0} mã.`);
        }
        
        for (const serialStr of item.serials) {
            let serialRecord;
            if (transaction_type === "IN") {
              serialRecord = await SerialNumber.findOne({ where: { imei_or_serial_number: serialStr, variant_id: item.variant_id } });
              if (serialRecord) {
                if (serialRecord.status === 'available') {
                  throw new Error(`Serial ${serialStr} already exists and is available in warehouse ${serialRecord.warehouse_id}`);
                } else {
                  await serialRecord.update({ status: 'available', warehouse_id: warehouse_id }, { transaction: t });
                }
              } else {
                serialRecord = await SerialNumber.create({
                  variant_id: item.variant_id,
                  imei_or_serial_number: serialStr,
                  status: 'available',
                  warehouse_id: warehouse_id,
                  created_at: new Date()
                }, { transaction: t });
              }
            } else if (transaction_type === "OUT") {
              serialRecord = await SerialNumber.findOne({ where: { imei_or_serial_number: serialStr, variant_id: item.variant_id } });
              if (!serialRecord) {
                throw new Error(`Serial ${serialStr} not found for variant ${item.variant_id}`);
              }
              if (serialRecord.warehouse_id !== warehouse_id) {
                throw new Error(`Serial ${serialStr} is not in warehouse ${warehouse_id}`);
              }
              if (serialRecord.status !== 'available') {
                throw new Error(`Serial ${serialStr} is not available for export (status: ${serialRecord.status})`);
              }
              await serialRecord.update({ status: 'sold' }, { transaction: t });
            }

            await InventoryTransactionSerial.create({
              transaction_item_id: txItem.id,
              serial_number_id: serialRecord.id
            }, { transaction: t });
          }

        // Update inventory quantity
        let inventoryRecord = await Inventory.findOne({
          where: { warehouse_id, variant_id: item.variant_id }
        });

        if (!inventoryRecord) {
          if (transaction_type === "OUT") {
            throw new Error(`Insufficient stock for variant ${item.variant_id}`);
          }
          inventoryRecord = await Inventory.create({
            warehouse_id,
            variant_id: item.variant_id,
            quantity: 0,
            reserved_quantity: 0,
            created_at: new Date(),
            updated_at: new Date()
          }, { transaction: t });
        }

        let newQuantity = inventoryRecord.quantity;
        if (transaction_type === "IN") {
          newQuantity += item.quantity;
        } else if (transaction_type === "OUT") {
          newQuantity -= item.quantity;
          if (newQuantity < 0) {
            throw new Error(`Insufficient stock for variant ${item.variant_id}`);
          }
        }

        await inventoryRecord.update({ 
          quantity: newQuantity, 
          updated_at: new Date() 
        }, { transaction: t });
      }
    }

    await t.commit();
    return { success: true, message: "Inventory transaction completed", data: transaction };
  } catch (error) {
    await t.rollback();
    throw new Error("Error creating inventory transaction: " + error.message);
  }
};

const getTransactionByIdService = async (id) => {
  try {
    const transaction = await InventoryTransaction.findByPk(id, {
      include: [
        { 
          model: Admin, 
          attributes: ['id', 'email', 'name'] 
        },
        {
          model: InventoryTransactionItem,
          include: [
            {
              model: ProductVariant,
              include: [
                {
                  model: Product,
                  attributes: ['id', 'name']
                }
              ]
            },
            {
              model: InventoryTransactionSerial,
              include: [
                {
                  model: SerialNumber,
                  attributes: ['id', 'imei_or_serial_number', 'status']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!transaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }

    return { success: true, data: transaction };
  } catch (error) {
    throw new Error("Error fetching inventory transaction: " + error.message);
  }
};

const getAvailableSerialsService = async (variantId, warehouseId) => {
  try {
    const serials = await SerialNumber.findAll({
      where: {
        variant_id: variantId,
        warehouse_id: warehouseId,
        status: 'available'
      },
      attributes: ['id', 'imei_or_serial_number', 'status']
    });
    return { success: true, data: serials };
  } catch (error) {
    throw new Error("Error fetching available serials: " + error.message);
  }
};

module.exports = {
  getInventoryService,
  createTransactionService,
  getTransactionByIdService,
  getAvailableSerialsService
};

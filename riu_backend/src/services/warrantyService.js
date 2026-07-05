const db = require("../models");

const activateWarrantyService = async (data) => {
  try {
    const { serial_number_id, user_id, order_id, purchase_date, warranty_months } = data;
    
    const purchaseDate = new Date(purchase_date || Date.now());
    const expiryDate = new Date(purchaseDate);
    expiryDate.setMonth(expiryDate.getMonth() + (warranty_months || 12));

    const warranty = await db.Warranty.create({
      serial_number_id,
      user_id,
      order_id,
      purchase_date: purchaseDate,
      expiry_date: expiryDate,
      status: "active"
    });

    return { success: true, message: "Warranty activated", data: warranty };
  } catch (error) {
    throw new Error("Error activating warranty: " + error.message);
  }
};

const getUserWarrantiesService = async (userId) => {
  try {
    const warranties = await db.Warranty.findAll({
      where: { user_id: userId },
      include: [
        { 
          model: db.SerialNumber, 
          include: [
            { 
              model: db.ProductVariant, 
              include: [db.Product] 
            }
          ] 
        }
      ]
    });
    return { success: true, data: warranties };
  } catch (error) {
    throw new Error("Error fetching warranties: " + error.message);
  }
};

const getAllWarrantiesAdminService = async () => {
  try {
    const warranties = await db.Warranty.findAll({
      include: [
        { 
          model: db.SerialNumber, 
          include: [
            { 
              model: db.ProductVariant, 
              include: [db.Product] 
            }
          ] 
        },
        { model: db.User, attributes: ['name', 'email', 'phone'] },
        { model: db.Order, attributes: ['order_code'] }
      ],
      order: [['id', 'DESC']]
    });
    return { success: true, data: warranties };
  } catch (error) {
    throw new Error("Lỗi lấy danh sách bảo hành: " + error.message);
  }
};

const lookupWarrantyBySerialNumberService = async (serialString) => {
  try {
    const serialRecord = await db.SerialNumber.findOne({
      where: { imei_or_serial_number: serialString }
    });

    if (!serialRecord) {
      return { success: false, message: "Không tìm thấy số Serial/IMEI này" };
    }

    const warranty = await db.Warranty.findOne({
      where: { serial_number_id: serialRecord.id },
      include: [
        { 
          model: db.SerialNumber, 
          include: [
            { 
              model: db.ProductVariant, 
              include: [db.Product] 
            }
          ] 
        },
        { model: db.User, attributes: ['name', 'email', 'phone'] }
      ]
    });

    if (!warranty) {
      return { success: false, message: "Sản phẩm này chưa được kích hoạt bảo hành" };
    }

    return { success: true, data: warranty };
  } catch (error) {
    throw new Error("Lỗi tra cứu bảo hành: " + error.message);
  }
};

module.exports = {
  activateWarrantyService,
  getUserWarrantiesService,
  getAllWarrantiesAdminService,
  lookupWarrantyBySerialNumberService
};

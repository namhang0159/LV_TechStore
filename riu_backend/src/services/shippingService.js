const db = require("../models");

// --- Shipping Partners ---
const createShippingPartnerService = async (data) => {
  try {
    const partner = await db.ShippingPartner.create({
      name: data.name,
      api_code: data.api_code
    });
    return { success: true, message: "Shipping partner created", data: partner };
  } catch (error) {
    throw new Error("Error creating shipping partner: " + error.message);
  }
};

const getAllShippingPartnersService = async () => {
  try {
    const partners = await db.ShippingPartner.findAll();
    return { success: true, data: partners };
  } catch (error) {
    throw new Error("Error fetching shipping partners: " + error.message);
  }
};

const updateShippingPartnerService = async (id, data) => {
  try {
    const partner = await db.ShippingPartner.findByPk(id);
    if (!partner) throw new Error("Shipping partner not found");
    await partner.update({
      name: data.name || partner.name,
      api_code: data.api_code || partner.api_code
    });
    return { success: true, message: "Shipping partner updated", data: partner };
  } catch (error) {
    throw new Error("Error updating shipping partner: " + error.message);
  }
};

const deleteShippingPartnerService = async (id) => {
  try {
    const partner = await db.ShippingPartner.findByPk(id);
    if (!partner) throw new Error("Shipping partner not found");
    await partner.destroy();
    return { success: true, message: "Shipping partner deleted" };
  } catch (error) {
    throw new Error("Error deleting shipping partner: " + error.message);
  }
};

// --- Shipments ---
const createShipmentService = async (data) => {
  try {
    // Validate order exists
    const order = await db.Order.findByPk(data.order_id);
    if (!order) throw new Error("Order not found");

    const shipment = await db.Shipment.create({
      order_id: data.order_id,
      shipping_partner_id: data.shipping_partner_id,
      tracking_number: data.tracking_number,
      estimated_delivery_at: data.estimated_delivery_at,
    });
    
    return { success: true, message: "Shipment created", data: shipment };
  } catch (error) {
    throw new Error("Error creating shipment: " + error.message);
  }
};

const updateShipmentStatusService = async (id, data) => {
  try {
    const shipment = await db.Shipment.findByPk(id);
    if (!shipment) throw new Error("Shipment not found");
    
    await shipment.update({
      tracking_number: data.tracking_number || shipment.tracking_number,
      estimated_delivery_at: data.estimated_delivery_at || shipment.estimated_delivery_at,
      shipped_at: data.shipped_at || shipment.shipped_at,
      delivered_at: data.delivered_at || shipment.delivered_at
    });

    return { success: true, message: "Shipment updated", data: shipment };
  } catch (error) {
    throw new Error("Error updating shipment: " + error.message);
  }
};

module.exports = {
  createShippingPartnerService,
  getAllShippingPartnersService,
  updateShippingPartnerService,
  deleteShippingPartnerService,
  createShipmentService,
  updateShipmentStatusService
};

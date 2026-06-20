module.exports = (sequelize, DataTypes) => {
  const Shipment = sequelize.define(
    "Shipment",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: DataTypes.INTEGER,
      shipping_partner_id: DataTypes.INTEGER,
      tracking_number: DataTypes.STRING,
      estimated_delivery_at: DataTypes.DATE,
      shipped_at: DataTypes.DATE,
      delivered_at: DataTypes.DATE,
    },
    {
      tableName: "shipments",
      timestamps: false,
    },
  );

  return Shipment;
};

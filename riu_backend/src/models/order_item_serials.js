module.exports = (sequelize, DataTypes) => {
  const OrderItemSerial = sequelize.define(
    "OrderItemSerial",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      order_item_id: DataTypes.INTEGER,
      serial_number_id: DataTypes.INTEGER,
    },
    {
      tableName: "order_item_serials",
      timestamps: false,
    }
  );

  return OrderItemSerial;
};

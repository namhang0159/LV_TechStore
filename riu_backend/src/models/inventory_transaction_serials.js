module.exports = (sequelize, DataTypes) => {
  const InventoryTransactionSerial = sequelize.define(
    "InventoryTransactionSerial",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      transaction_item_id: DataTypes.INTEGER,
      serial_number_id: DataTypes.INTEGER,
    },
    {
      tableName: "inventory_transaction_serials",
      timestamps: false,
    }
  );

  return InventoryTransactionSerial;
};

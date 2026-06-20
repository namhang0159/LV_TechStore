module.exports = (sequelize, DataTypes) => {
  const InventoryTransactionItem = sequelize.define(
    "InventoryTransactionItem",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      transaction_id: DataTypes.INTEGER,
      variant_id: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      unit_cost: DataTypes.DECIMAL,
      created_at: DataTypes.DATE,
    },
    {
      tableName: "inventory_transaction_items",
      timestamps: false,
    }
  );

  return InventoryTransactionItem;
};

module.exports = (sequelize, DataTypes) => {
  const InventoryTransaction = sequelize.define(
    "InventoryTransaction",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      warehouse_id: DataTypes.INTEGER,
      transaction_type: DataTypes.STRING,
      reference_type: DataTypes.STRING,
      reference_id: DataTypes.INTEGER,
      created_by: DataTypes.INTEGER,
      note: DataTypes.TEXT,
      created_at: DataTypes.DATE,
    },
    {
      tableName: "inventory_transactions",
      timestamps: false,
    }
  );

  return InventoryTransaction;
};

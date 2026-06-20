module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define(
    "Inventory",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      variant_id: DataTypes.INTEGER,
      warehouse_id: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      reserved_quantity: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: "inventory",
      timestamps: false,
    },
  );

  return Inventory;
};
